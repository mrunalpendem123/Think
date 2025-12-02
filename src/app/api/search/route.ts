import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { MetaSearchAgentType } from '@/lib/search/metaSearchAgent';
import { searchHandlers } from '@/lib/search';
import ModelRegistry from '@/lib/models/registry';
import { ModelWithProvider } from '@/lib/models/types';

interface ChatRequestBody {
  optimizationMode: 'speed' | 'balanced';
  focusMode: string;
  chatModel: ModelWithProvider;
  embeddingModel: ModelWithProvider;
  query: string;
  history: Array<[string, string]>;
  stream?: boolean;
  systemInstructions?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: ChatRequestBody = await req.json();

    if (!body.focusMode || !body.query) {
      return Response.json(
        { message: 'Missing focus mode or query' },
        { status: 400 },
      );
    }

    body.history = body.history || [];
    body.optimizationMode = body.optimizationMode || 'balanced';
    body.stream = body.stream || false;

    const history: BaseMessage[] = body.history.map((msg) => {
      return msg[0] === 'human'
        ? new HumanMessage({ content: msg[1] })
        : new AIMessage({ content: msg[1] });
    });

    let registry: ModelRegistry;
    try {
      registry = new ModelRegistry();
      // Verify we have at least one provider configured
      if (registry.activeProviders.length === 0) {
        console.error('No active providers found in ModelRegistry');
        return Response.json(
          {
            message: 'No AI model providers are configured. Please configure a provider in settings.',
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
          message: `Failed to initialize model registry: ${errorDetails}`,
        },
        { status: 500 },
      );
    }

    let llm, embeddings;
    try {
      console.log('Loading models for search:', {
        chatProviderId: body.chatModel.providerId,
        chatModelKey: body.chatModel.key,
        embeddingProviderId: body.embeddingModel.providerId,
        embeddingModelKey: body.embeddingModel.key,
      });
      
      [llm, embeddings] = await Promise.all([
        registry.loadChatModel(body.chatModel.providerId, body.chatModel.key),
        registry.loadEmbeddingModel(
          body.embeddingModel.providerId,
          body.embeddingModel.key,
        ),
      ]);
      
      console.log('Models loaded successfully for search');
    } catch (modelError) {
      console.error('Error loading models for search:', modelError);
      const errorDetails = modelError instanceof Error ? modelError.message : String(modelError);
      const errorStack = modelError instanceof Error ? modelError.stack : undefined;
      console.error('Model loading error details:', { errorDetails, errorStack });
      
      // Check if it's a provider not found error
      if (errorDetails.includes('Invalid provider')) {
        return Response.json(
          {
            message: `Model provider not found. Please ensure your AI provider is properly configured.`,
          },
          { status: 500 },
        );
      }
      
      return Response.json(
        {
          message: `Failed to load models: ${errorDetails}`,
        },
        { status: 500 },
      );
    }

    const searchHandler: MetaSearchAgentType = searchHandlers[body.focusMode];

    if (!searchHandler) {
      console.error('Invalid focus mode:', body.focusMode);
      return Response.json({ message: 'Invalid focus mode' }, { status: 400 });
    }

    let emitter;
    try {
      emitter = await searchHandler.searchAndAnswer(
        body.query,
        history,
        llm,
        embeddings,
        body.optimizationMode,
        [],
        body.systemInstructions || '',
      );
    } catch (searchError) {
      console.error('Error in searchHandler.searchAndAnswer:', searchError);
      const errorDetails = searchError instanceof Error ? searchError.message : String(searchError);
      const errorStack = searchError instanceof Error ? searchError.stack : undefined;
      console.error('Search handler error details:', { errorDetails, errorStack });
      return Response.json(
        {
          message: `Search failed: ${errorDetails}`,
        },
        { status: 500 },
      );
    }

    if (!body.stream) {
      return new Promise(
        (
          resolve: (value: Response) => void,
          reject: (value: Response) => void,
        ) => {
          let message = '';
          let sources: any[] = [];

          emitter.on('data', (data: string) => {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.type === 'response') {
                message += parsedData.data;
              } else if (parsedData.type === 'sources') {
                sources = parsedData.data;
              }
            } catch (error) {
              reject(
                Response.json(
                  { message: 'Error parsing data' },
                  { status: 500 },
                ),
              );
            }
          });

          emitter.on('end', () => {
            resolve(Response.json({ message, sources }, { status: 200 }));
          });

          emitter.on('error', (error: any) => {
            reject(
              Response.json(
                { message: 'Search error', error },
                { status: 500 },
              ),
            );
          });
        },
      );
    }

    const encoder = new TextEncoder();

    const abortController = new AbortController();
    const { signal } = abortController;

    const stream = new ReadableStream({
      start(controller) {
        let sources: any[] = [];

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'init',
              data: 'Stream connected',
            }) + '\n',
          ),
        );

        signal.addEventListener('abort', () => {
          emitter.removeAllListeners();

          try {
            controller.close();
          } catch (error) {}
        });

        emitter.on('data', (data: string) => {
          if (signal.aborted) return;

          try {
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'response') {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'response',
                    data: parsedData.data,
                  }) + '\n',
                ),
              );
            } else if (parsedData.type === 'sources') {
              sources = parsedData.data;
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'sources',
                    data: sources,
                  }) + '\n',
                ),
              );
            }
          } catch (error) {
            controller.error(error);
          }
        });

        emitter.on('end', () => {
          if (signal.aborted) return;

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'done',
              }) + '\n',
            ),
          );
          controller.close();
        });

        emitter.on('error', (error: any) => {
          if (signal.aborted) return;

          controller.error(error);
        });
      },
      cancel() {
        abortController.abort();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Error in search API route:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error('Search API error details:', { errorMessage, errorStack });
    return Response.json(
      { 
        message: 'An error occurred while processing search request',
        error: errorMessage,
      },
      { status: 500 },
    );
  }
};
