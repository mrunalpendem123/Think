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

// Global error handler wrapper
const handleRouteError = (error: unknown, context: string): Response => {
  console.error(`[${context}] Error:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error(`[${context}] Error details:`, { errorMessage, errorStack });
  
  return Response.json(
    {
      type: 'error',
      message: 'An error occurred while processing your request',
      data: errorMessage,
    },
    { status: 500 },
  );
};

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
            .catch((dbError: any) => {
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
            .catch((dbError: any) => {
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
        .catch((dbError: any) => {
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
  try {
    // Safely query database - handle mock database gracefully
    let chat;
    try {
      chat = await db.query.chats.findFirst({
        where: eq(chats.id, message.chatId),
      });
    } catch (queryError) {
      console.warn('Error querying chat from DB (using mock?):', queryError);
      chat = null;
    }

    const fileData = files.map(getFileDetails);

    if (!chat) {
      try {
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
      } catch (insertError) {
        console.warn('Error inserting chat to DB (using mock?):', insertError);
      }
    } else if (JSON.stringify(chat.files ?? []) != JSON.stringify(fileData)) {
      try {
        await db.update(chats)
          .set({
            files: files.map(getFileDetails),
          })
          .where(eq(chats.id, message.chatId))
          .execute();
      } catch (updateError) {
        console.warn('Error updating chat in DB (using mock?):', updateError);
      }
    }

    let messageExists;
    try {
      messageExists = await db.query.messages.findFirst({
        where: eq(messagesSchema.messageId, humanMessageId),
      });
    } catch (queryError) {
      console.warn('Error querying message from DB (using mock?):', queryError);
      messageExists = null;
    }

    if (!messageExists) {
      try {
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
      } catch (insertError) {
        console.warn('Error inserting message to DB (using mock?):', insertError);
      }
    } else {
      try {
        await db
          .delete(messagesSchema)
          .where(
            and(
              gt(messagesSchema.id, messageExists.id),
              eq(messagesSchema.chatId, message.chatId),
            ),
          )
          .execute();
      } catch (deleteError) {
        console.warn('Error deleting messages from DB (using mock?):', deleteError);
      }
    }
  } catch (error) {
    // Don't throw - history save is non-critical
    console.error('Error in handleHistorySave (non-critical):', error);
  }
};

const POSTHandler = async (req: Request): Promise<Response> => {
  try {
    let reqBody: any;
    try {
      reqBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return Response.json(
        {
          type: 'error',
          message: 'Invalid JSON in request body',
          data: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { status: 400 },
      );
    }

    // Validate required fields before processing
    if (!reqBody || typeof reqBody !== 'object') {
      return Response.json(
        {
          type: 'error',
          message: 'Invalid request body',
        },
        { status: 400 },
      );
    }

    const parseBody = safeValidateBody(reqBody);
    if (!parseBody.success) {
      console.error('Invalid request body:', parseBody.error);
      return Response.json(
        {
          type: 'error',
          message: 'Invalid request body',
          data: parseBody.error,
        },
        { status: 400 },
      );
    }

    const body = parseBody.data as Body;
    const { message } = body;

    // Validate message exists and has content
    if (!message || !message.content || message.content.trim() === '') {
      return Response.json(
        {
          type: 'error',
          message: 'Please provide a message to process',
        },
        { status: 400 },
      );
    }

    // Validate chatModel and embeddingModel exist
    if (!body.chatModel || !body.chatModel.providerId || !body.chatModel.key) {
      return Response.json(
        {
          type: 'error',
          message: 'Chat model configuration is missing',
        },
        { status: 400 },
      );
    }

    if (!body.embeddingModel || !body.embeddingModel.providerId || !body.embeddingModel.key) {
      return Response.json(
        {
          type: 'error',
          message: 'Embedding model configuration is missing',
        },
        { status: 400 },
      );
    }

    // Validate focusMode
    if (!body.focusMode || typeof body.focusMode !== 'string') {
      return Response.json(
        {
          type: 'error',
          message: 'Focus mode is required',
        },
        { status: 400 },
      );
    }

    let registry: ModelRegistry;
    try {
      registry = new ModelRegistry();
      // Verify we have at least one provider configured
      if (registry.activeProviders.length === 0) {
        console.error('No active providers found in ModelRegistry');
        return Response.json(
          {
            type: 'error',
            data: 'No AI model providers are configured. Please configure a provider in settings.',
          },
          { status: 500 },
        );
      }
    } catch (registryError) {
      console.error('Error creating ModelRegistry:', registryError);
      const errorDetails = registryError instanceof Error ? registryError.message : String(registryError);
      const errorStack = registryError instanceof Error ? registryError.stack : undefined;
      console.error('Registry error details:', { errorDetails, errorStack });
      return Response.json(
        {
          type: 'error',
          data: `Failed to initialize model registry: ${errorDetails}`,
        },
        { status: 500 },
      );
    }

    let llm, embedding;
    try {
      console.log('Loading models:', {
        chatProviderId: body.chatModel.providerId,
        chatModelKey: body.chatModel.key,
        embeddingProviderId: body.embeddingModel.providerId,
        embeddingModelKey: body.embeddingModel.key,
      });
      
      [llm, embedding] = await Promise.all([
        registry.loadChatModel(body.chatModel.providerId, body.chatModel.key),
        registry.loadEmbeddingModel(
          body.embeddingModel.providerId,
          body.embeddingModel.key,
        ),
      ]);
      
      console.log('Models loaded successfully');
    } catch (modelError) {
      console.error('Error loading models:', modelError);
      const errorDetails = modelError instanceof Error ? modelError.message : String(modelError);
      const errorStack = modelError instanceof Error ? modelError.stack : undefined;
      console.error('Model loading error details:', { errorDetails, errorStack });
      
      // Check if it's a provider not found error
      if (errorDetails.includes('Invalid provider')) {
        return Response.json(
          {
            type: 'error',
            data: `Model provider not found. Please ensure your AI provider is properly configured.`,
          },
          { status: 500 },
        );
      }
      
      return Response.json(
        {
          type: 'error',
          data: `Failed to load models: ${errorDetails}`,
        },
        { status: 500 },
      );
    }

    const humanMessageId =
      message.messageId ?? crypto.randomBytes(7).toString('hex');

    // Safely build history array with validation
    const history: BaseMessage[] = (body.history || [])
      .map((msg): BaseMessage | null => {
        if (!Array.isArray(msg) || msg.length !== 2) {
          console.warn('Invalid history message format:', msg);
          return null;
        }
        if (msg[0] === 'human') {
          return new HumanMessage({
            content: String(msg[1] || ''),
          });
        } else {
          return new AIMessage({
            content: String(msg[1] || ''),
          });
        }
      })
      .filter((msg): msg is BaseMessage => msg !== null);

    const handler = searchHandlers[body.focusMode];

    if (!handler) {
      console.error('Invalid focus mode:', body.focusMode);
      return Response.json(
        {
          type: 'error',
          message: `Invalid focus mode: ${body.focusMode}`,
        },
        { status: 400 },
      );
    }

    let stream: EventEmitter;
    try {
      console.log('Calling searchAndAnswer with:', {
        focusMode: body.focusMode,
        messageLength: message.content.length,
        historyLength: history.length,
        optimizationMode: body.optimizationMode,
        filesCount: body.files.length,
      });
      
      stream = await handler.searchAndAnswer(
        message.content,
        history,
        llm,
        embedding,
        body.optimizationMode,
        body.files,
        body.systemInstructions as string,
      );
      
      console.log('searchAndAnswer returned successfully');
    } catch (streamError) {
      console.error('Error getting stream from handler:', streamError);
      const errorDetails = streamError instanceof Error ? streamError.message : String(streamError);
      const errorStack = streamError instanceof Error ? streamError.stack : undefined;
      console.error('Stream error details:', { errorDetails, errorStack });
      return Response.json(
        {
          type: 'error',
          data: `Failed to start processing: ${errorDetails}`,
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

    handleEmitterEvents(stream, writer, encoder, message.chatId)
      .then(() => {
        clearTimeout(timeoutId);
        try {
          writer.close();
        } catch (closeError) {
          console.error('Error closing writer:', closeError);
        }
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
          try {
            writer.close();
          } catch (closeError) {
            console.error('Error closing writer after error:', closeError);
          }
        }
      });

    // Don't await handleHistorySave - let it run in background
    handleHistorySave(message, humanMessageId, body.focusMode, body.files).catch(
      (error: any) => {
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
    return handleRouteError(err, 'POST /api/chat');
  }
};

// Export with additional error boundary
export const POST = async (req: Request): Promise<Response> => {
  try {
    return await POSTHandler(req);
  } catch (outerError) {
    // This catches any errors that escape the inner try-catch
    console.error('Fatal error in POST handler:', outerError);
    return Response.json(
      {
        type: 'error',
        message: 'A fatal error occurred',
        data: outerError instanceof Error ? outerError.message : String(outerError),
      },
      { status: 500 },
    );
  }
};
