import crypto from 'crypto';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { EventEmitter } from 'stream';
import db from '@/lib/db';
import { chats, messages as messagesSchema } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { getFileDetails } from '@/lib/utils/files';
import { searchHandlers } from '@/lib/search';
import { z } from 'zod';
import ModelRegistry from '@/lib/models/registry';
import { ModelWithProvider } from '@/lib/models/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  chatId: z.string().min(1, 'Chat ID is required'),
  content: z.string().min(1, 'Message content is required'),
});

const chatModelSchema: z.ZodType<ModelWithProvider> = z.object({
  providerId: z.string({
    errorMap: () => ({
      message: 'Chat model provider id must be provided',
    }),
  }),
  key: z.string({
    errorMap: () => ({
      message: 'Chat model key must be provided',
    }),
  }),
});

const embeddingModelSchema: z.ZodType<ModelWithProvider> = z.object({
  providerId: z.string({
    errorMap: () => ({
      message: 'Embedding model provider id must be provided',
    }),
  }),
  key: z.string({
    errorMap: () => ({
      message: 'Embedding model key must be provided',
    }),
  }),
});

const bodySchema = z.object({
  message: messageSchema,
  optimizationMode: z.enum(['speed', 'balanced', 'quality'], {
    errorMap: () => ({
      message: 'Optimization mode must be one of: speed, balanced, quality',
    }),
  }),
  focusMode: z.string().min(1, 'Focus mode is required'),
  history: z
    .array(
      z.tuple([z.string(), z.string()], {
        errorMap: () => ({
          message: 'History items must be tuples of two strings',
        }),
      }),
    )
    .optional()
    .default([]),
  files: z.array(z.string()).optional().default([]),
  chatModel: chatModelSchema,
  embeddingModel: embeddingModelSchema,
  systemInstructions: z.string().nullable().optional().default(''),
});

type Message = z.infer<typeof messageSchema>;
type Body = z.infer<typeof bodySchema>;

const safeValidateBody = (data: unknown) => {
  const result = bodySchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

const handleEmitterEvents = async (
  stream: EventEmitter,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  chatId: string,
) => {
  let receivedMessage = '';
  const aiMessageId = crypto.randomBytes(7).toString('hex');

  stream.on('data', (data) => {
    try {
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (parseError) {
        console.error('Error parsing stream data:', parseError, 'Data:', data);
        return;
      }

      if (parsedData.type === 'response') {
        try {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'message',
                data: parsedData.data,
                messageId: aiMessageId,
              }) + '\n',
            ),
          );
          receivedMessage += parsedData.data || '';
        } catch (writeError) {
          console.error('Error writing message:', writeError);
        }
      } else if (parsedData.type === 'sources') {
        try {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'sources',
                data: parsedData.data,
                messageId: aiMessageId,
              }) + '\n',
            ),
          );

          const sourceMessageId = crypto.randomBytes(7).toString('hex');

          db.insert(messagesSchema)
            .values({
              chatId: chatId,
              messageId: sourceMessageId,
              role: 'source',
              sources: parsedData.data,
              createdAt: new Date().toString(),
            })
            .execute()
            .catch((dbError) => {
              console.error('Error saving sources to DB:', dbError);
            });
        } catch (writeError) {
          console.error('Error writing sources:', writeError);
        }
      } else if (parsedData.type === 'template') {
        try {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'template',
                template: parsedData.template,
                data: parsedData.data,
                messageId: aiMessageId,
              }) + '\n',
            ),
          );

          const templateMessageId = crypto.randomBytes(7).toString('hex');

          db.insert(messagesSchema)
            .values({
              chatId: chatId,
              messageId: templateMessageId,
              role: 'template',
              template: parsedData.template,
              data: parsedData.data,
              createdAt: new Date().toString(),
            })
            .execute()
            .catch((dbError) => {
              console.error('Error saving template to DB:', dbError);
            });
        } catch (writeError) {
          console.error('Error writing template:', writeError);
        }
      }
    } catch (error) {
      console.error('Unexpected error in stream data handler:', error);
    }
  });
  stream.on('end', () => {
    try {
      // Ensure we write something if we have a message
      if (receivedMessage.trim()) {
        writer.write(
          encoder.encode(
            JSON.stringify({
              type: 'messageEnd',
            }) + '\n',
          ),
        );
      }
      writer.close();

      db.insert(messagesSchema)
        .values({
          content: receivedMessage,
          chatId: chatId,
          messageId: aiMessageId,
          role: 'assistant',
          createdAt: new Date().toString(),
        })
        .execute()
        .catch((dbError) => {
          console.error('Error saving assistant message to DB:', dbError);
        });
    } catch (error) {
      console.error('Error in stream end handler:', error);
      try {
        writer.close();
      } catch (closeError) {
        console.error('Error closing writer on end:', closeError);
      }
    }
  });
  stream.on('error', (error) => {
    console.error('Stream error:', error);
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'error',
            data: errorMessage || 'An error occurred while processing your request',
          }) + '\n',
        ),
      );
    } catch (writeError) {
      console.error('Error writing error message:', writeError);
    }
    try {
      writer.close();
    } catch (closeError) {
      console.error('Error closing writer:', closeError);
    }
  });
};

const handleHistorySave = async (
  message: Message,
  humanMessageId: string,
  focusMode: string,
  files: string[],
) => {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, message.chatId),
  });

  const fileData = files.map(getFileDetails);

  if (!chat) {
    await db
      .insert(chats)
      .values({
        id: message.chatId,
        title: message.content,
        createdAt: new Date().toString(),
        focusMode: focusMode,
        files: fileData,
      })
      .execute();
  } else if (JSON.stringify(chat.files ?? []) != JSON.stringify(fileData)) {
    db.update(chats)
      .set({
        files: files.map(getFileDetails),
      })
      .where(eq(chats.id, message.chatId));
  }

  const messageExists = await db.query.messages.findFirst({
    where: eq(messagesSchema.messageId, humanMessageId),
  });

  if (!messageExists) {
    await db
      .insert(messagesSchema)
      .values({
        content: message.content,
        chatId: message.chatId,
        messageId: humanMessageId,
        role: 'user',
        createdAt: new Date().toString(),
      })
      .execute();
  } else {
    await db
      .delete(messagesSchema)
      .where(
        and(
          gt(messagesSchema.id, messageExists.id),
          eq(messagesSchema.chatId, message.chatId),
        ),
      )
      .execute();
  }
};

export const POST = async (req: Request) => {
  try {
    const reqBody = (await req.json()) as Body;

    const parseBody = safeValidateBody(reqBody);
    if (!parseBody.success) {
      return Response.json(
        { message: 'Invalid request body', error: parseBody.error },
        { status: 400 },
      );
    }

    const body = parseBody.data as Body;
    const { message } = body;

    if (message.content === '') {
      return Response.json(
        {
          message: 'Please provide a message to process',
        },
        { status: 400 },
      );
    }

    const registry = new ModelRegistry();

    const [llm, embedding] = await Promise.all([
      registry.loadChatModel(body.chatModel.providerId, body.chatModel.key),
      registry.loadEmbeddingModel(
        body.embeddingModel.providerId,
        body.embeddingModel.key,
      ),
    ]);

    const humanMessageId =
      message.messageId ?? crypto.randomBytes(7).toString('hex');

    const history: BaseMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    const handler = searchHandlers[body.focusMode];

    if (!handler) {
      return Response.json(
        {
          message: 'Invalid focus mode',
        },
        { status: 400 },
      );
    }

    let stream: EventEmitter;
    try {
      stream = await handler.searchAndAnswer(
        message.content,
        history,
        llm,
        embedding,
        body.optimizationMode,
        body.files,
        body.systemInstructions as string,
      );
    } catch (streamError) {
      console.error('Error getting stream from handler:', streamError);
      return Response.json(
        {
          type: 'error',
          data: streamError instanceof Error ? streamError.message : 'Failed to start processing',
        },
        { status: 500 },
      );
    }

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Set a timeout to ensure we send something if stream doesn't emit
    const timeoutId = setTimeout(() => {
      console.warn('Stream timeout - no data received after 60 seconds');
      try {
        writer.write(
          encoder.encode(
            JSON.stringify({
              type: 'error',
              data: 'Request timed out. The AI is taking longer than expected. Please try again.',
            }) + '\n',
          ),
        );
        writer.close();
      } catch (error) {
        console.error('Error writing timeout error:', error);
      }
    }, 60000);

    // Note: Don't send empty message - let the stream handle first message
    // This ensures proper message ID assignment

    // Handle errors in the stream processing
    handleEmitterEvents(stream, writer, encoder, message.chatId)
      .then(() => {
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Error in handleEmitterEvents:', error);
        try {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                data: error instanceof Error ? error.message : 'An error occurred while processing your request',
              }) + '\n',
            ),
          );
          writer.close();
        } catch (writeError) {
          console.error('Error writing error message:', writeError);
        }
      });

    // Don't await handleHistorySave - let it run in background
    handleHistorySave(message, humanMessageId, body.focusMode, body.files).catch(
      (error) => {
        console.error('Error saving history:', error);
      },
    );

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error('An error occurred while processing chat request:', err);
    return Response.json(
      { message: 'An error occurred while processing chat request' },
      { status: 500 },
    );
  }
};
