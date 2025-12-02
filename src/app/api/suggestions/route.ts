import generateSuggestions from '@/lib/chains/suggestionGeneratorAgent';
import ModelRegistry from '@/lib/models/registry';
import { ModelWithProvider } from '@/lib/models/types';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

const suggestionsBodySchema = z.object({
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).min(1, 'Chat history must contain at least one message'),
  chatModel: z.object({
    providerId: z.string().min(1, 'Provider ID is required'),
    key: z.string().min(1, 'Model key is required'),
  }),
});

type SuggestionsGenerationBody = z.infer<typeof suggestionsBodySchema>;

// Global error handler
const handleError = (error: unknown, context: string): Response => {
  console.error(`[${context}] Error:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error(`[${context}] Error details:`, { errorMessage, errorStack });
  
  return Response.json(
    {
      type: 'error',
      message: 'An error occurred while generating suggestions',
      data: errorMessage,
    },
    { 
      status: 500,
      headers: corsHeaders,
    },
  );
};

export const POST = async (req: Request): Promise<Response> => {
  try {
    // Parse request body
    let reqBody: any;
    try {
      reqBody = await req.json();
    } catch (parseError) {
      console.error('[POST /api/suggestions] Error parsing request body:', parseError);
      return Response.json(
        {
          type: 'error',
          message: 'Invalid JSON in request body',
          data: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { 
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Validate request body
    const parseResult = suggestionsBodySchema.safeParse(reqBody);
    if (!parseResult.success) {
      console.error('[POST /api/suggestions] Invalid request body:', parseResult.error);
      console.error('[POST /api/suggestions] Received body:', JSON.stringify(reqBody, null, 2));
      return Response.json(
        {
          type: 'error',
          message: 'Invalid request body',
          data: parseResult.error.errors,
        },
        { 
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const body = parseResult.data;

    // Validate chatHistory exists and has content
    if (!body.chatHistory || !Array.isArray(body.chatHistory) || body.chatHistory.length === 0) {
      return Response.json(
        {
          type: 'error',
          message: 'Chat history is required and must contain at least one message',
        },
        { 
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Convert chat history to LangChain messages
    let chatHistory: BaseMessage[];
    try {
      chatHistory = body.chatHistory
        .map((msg: any) => {
          if (!msg.content || typeof msg.content !== 'string') {
            return null;
          }
          if (msg.role === 'user') {
            return new HumanMessage(msg.content);
          } else if (msg.role === 'assistant') {
            return new AIMessage(msg.content);
          }
          return null;
        })
        .filter((msg): msg is BaseMessage => msg !== null);
      
      if (chatHistory.length === 0) {
        return Response.json(
          {
            type: 'error',
            message: 'No valid messages found in chat history',
          },
          { 
            status: 400,
            headers: corsHeaders,
          },
        );
      }
    } catch (historyError) {
      console.error('[POST /api/suggestions] Error converting chat history:', historyError);
      return Response.json(
        {
          type: 'error',
          message: 'Failed to process chat history',
          data: historyError instanceof Error ? historyError.message : String(historyError),
        },
        { 
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Initialize model registry
    let registry: ModelRegistry;
    try {
      registry = new ModelRegistry();
      if (registry.activeProviders.length === 0) {
        console.error('[POST /api/suggestions] No active providers found');
        return Response.json(
          {
            type: 'error',
            message: 'No AI model providers are configured',
          },
          { 
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    } catch (registryError) {
      console.error('[POST /api/suggestions] Error creating ModelRegistry:', registryError);
      return handleError(registryError, 'POST /api/suggestions - Registry Init');
    }

    // Load chat model
    let llm: BaseChatModel;
    try {
      console.log(`[POST /api/suggestions] Loading chat model: { providerId: '${body.chatModel.providerId}', key: '${body.chatModel.key}' }`);
      llm = await registry.loadChatModel(
        body.chatModel.providerId,
        body.chatModel.key,
      );
      console.log(`[POST /api/suggestions] Chat model loaded successfully`);
    } catch (modelError) {
      console.error('[POST /api/suggestions] Error loading chat model:', modelError);
      return Response.json(
        {
          type: 'error',
          message: 'Failed to load chat model',
          data: modelError instanceof Error ? modelError.message : String(modelError),
        },
        { 
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // Generate suggestions
    let suggestions: string[];
    try {
      console.log(`[POST /api/suggestions] Generating suggestions for ${chatHistory.length} messages`);
      suggestions = await generateSuggestions(
        {
          chat_history: chatHistory,
        },
        llm,
      );
      
      // Ensure suggestions is an array
      if (!Array.isArray(suggestions)) {
        console.warn('[POST /api/suggestions] Suggestions is not an array, converting:', suggestions);
        suggestions = [];
      }
      
      console.log(`[POST /api/suggestions] Generated ${suggestions.length} suggestions`);
    } catch (suggestionsError) {
      console.error('[POST /api/suggestions] Error generating suggestions:', suggestionsError);
      return Response.json(
        {
          type: 'error',
          message: 'Failed to generate suggestions',
          data: suggestionsError instanceof Error ? suggestionsError.message : String(suggestionsError),
        },
        { 
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    return Response.json(
      { suggestions: suggestions || [] }, 
      { 
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (err) {
    return handleError(err, 'POST /api/suggestions');
  }
};
