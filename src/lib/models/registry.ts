import { ConfigModelProvider } from '../config/types';
import BaseModelProvider, {
  createProviderInstance,
} from './providers/baseProvider';
import { getConfiguredModelProviders } from '../config/serverRegistry';
import { providers } from './providers';
import { MinimalProvider, ModelList } from './types';
import configManager from '../config';

class ModelRegistry {
  activeProviders: (ConfigModelProvider & {
    provider: BaseModelProvider<any>;
  })[] = [];

  constructor() {
    this.initializeActiveProviders();
  }

  private initializeActiveProviders() {
    const configuredProviders = getConfiguredModelProviders();
    console.log('[ModelRegistry] Initializing providers. Count:', configuredProviders.length);
    console.log('[ModelRegistry] Configured providers:', configuredProviders.map(p => ({ id: p.id, name: p.name, type: p.type, hasApiKey: !!p.config.apiKey, hasBaseURL: !!p.config.baseURL })));

    configuredProviders.forEach((p) => {
      try {
        const provider = providers[p.type];
        if (!provider) {
          console.error(`[ModelRegistry] Invalid provider type: ${p.type}`);
          throw new Error(`Invalid provider type: ${p.type}`);
        }

        console.log(`[ModelRegistry] Creating provider instance: ${p.type} (${p.name})`);
        const instance = createProviderInstance(provider, p.id, p.name, p.config);
        
        this.activeProviders.push({
          ...p,
          provider: instance,
        });
        console.log(`[ModelRegistry] Provider initialized successfully: ${p.type} (${p.name})`);
      } catch (err) {
        console.error(
          `[ModelRegistry] Failed to initialize provider. Type: ${p.type}, ID: ${p.id}, Name: ${p.name}, Config: ${JSON.stringify({ ...p.config, apiKey: p.config.apiKey ? '***' : 'MISSING' })}, Error: ${err}`,
        );
      }
    });
    
    console.log(`[ModelRegistry] Initialization complete. Active providers: ${this.activeProviders.length}`);
  }

  async getActiveProviders() {
    const providers: MinimalProvider[] = [];

    await Promise.all(
      this.activeProviders.map(async (p) => {
        let m: ModelList = { chat: [], embedding: [] };

        try {
          m = await p.provider.getModelList();
        } catch (err: any) {
          console.error(
            `Failed to get model list. Type: ${p.type}, ID: ${p.id}, Error: ${err.message}`,
          );

          m = {
            chat: [
              {
                key: 'error',
                name: err.message,
              },
            ],
            embedding: [],
          };
        }

        providers.push({
          id: p.id,
          name: p.name,
          chatModels: m.chat,
          embeddingModels: m.embedding,
        });
      }),
    );

    return providers;
  }

  async loadChatModel(providerId: string, modelName: string) {
    console.log('[ModelRegistry] Loading chat model:', { providerId, modelName });
    console.log('[ModelRegistry] Active providers:', this.activeProviders.map(p => ({ id: p.id, name: p.name, type: p.type })));
    
    const provider = this.activeProviders.find((p) => p.id === providerId);

    if (!provider) {
      const availableIds = this.activeProviders.map(p => p.id);
      console.error('[ModelRegistry] Provider not found:', { providerId, availableIds });
      throw new Error(`Invalid provider id: ${providerId}. Available providers: ${availableIds.join(', ')}`);
    }

    console.log('[ModelRegistry] Found provider:', { id: provider.id, name: provider.name, type: provider.type });
    
    try {
      const model = await provider.provider.loadChatModel(modelName);
      console.log('[ModelRegistry] Chat model loaded successfully:', modelName);
      return model;
    } catch (error) {
      console.error('[ModelRegistry] Error loading chat model:', error);
      throw error;
    }
  }

  async loadEmbeddingModel(providerId: string, modelName: string) {
    console.log('[ModelRegistry] Loading embedding model:', { providerId, modelName });
    console.log('[ModelRegistry] Active providers:', this.activeProviders.map(p => ({ id: p.id, name: p.name, type: p.type })));
    
    const provider = this.activeProviders.find((p) => p.id === providerId);

    if (!provider) {
      const availableIds = this.activeProviders.map(p => p.id);
      console.error('[ModelRegistry] Provider not found:', { providerId, availableIds });
      throw new Error(`Invalid provider id: ${providerId}. Available providers: ${availableIds.join(', ')}`);
    }

    console.log('[ModelRegistry] Found provider:', { id: provider.id, name: provider.name, type: provider.type });
    
    try {
      const model = await provider.provider.loadEmbeddingModel(modelName);
      console.log('[ModelRegistry] Embedding model loaded successfully:', modelName);
      return model;
    } catch (error) {
      console.error('[ModelRegistry] Error loading embedding model:', error);
      throw error;
    }
  }

  async addProvider(
    type: string,
    name: string,
    config: Record<string, any>,
  ): Promise<ConfigModelProvider> {
    const provider = providers[type];
    if (!provider) throw new Error('Invalid provider type');

    const newProvider = configManager.addModelProvider(type, name, config);

    const instance = createProviderInstance(
      provider,
      newProvider.id,
      newProvider.name,
      newProvider.config,
    );

    let m: ModelList = { chat: [], embedding: [] };

    try {
      m = await instance.getModelList();
    } catch (err: any) {
      console.error(
        `Failed to get model list for newly added provider. Type: ${type}, ID: ${newProvider.id}, Error: ${err.message}`,
      );

      m = {
        chat: [
          {
            key: 'error',
            name: err.message,
          },
        ],
        embedding: [],
      };
    }

    this.activeProviders.push({
      ...newProvider,
      provider: instance,
    });

    return {
      ...newProvider,
      chatModels: m.chat || [],
      embeddingModels: m.embedding || [],
    };
  }

  async removeProvider(providerId: string): Promise<void> {
    configManager.removeModelProvider(providerId);
    this.activeProviders = this.activeProviders.filter(
      (p) => p.id !== providerId,
    );

    return;
  }

  async updateProvider(
    providerId: string,
    name: string,
    config: any,
  ): Promise<ConfigModelProvider> {
    const updated = await configManager.updateModelProvider(
      providerId,
      name,
      config,
    );
    const instance = createProviderInstance(
      providers[updated.type],
      providerId,
      name,
      config,
    );

    let m: ModelList = { chat: [], embedding: [] };

    try {
      m = await instance.getModelList();
    } catch (err: any) {
      console.error(
        `Failed to get model list for updated provider. Type: ${updated.type}, ID: ${updated.id}, Error: ${err.message}`,
      );

      m = {
        chat: [
          {
            key: 'error',
            name: err.message,
          },
        ],
        embedding: [],
      };
    }

    this.activeProviders.push({
      ...updated,
      provider: instance,
    });

    return {
      ...updated,
      chatModels: m.chat || [],
      embeddingModels: m.embedding || [],
    };
  }

  /* Using async here because maybe in the future we might want to add some validation?? */
  async addProviderModel(
    providerId: string,
    type: 'embedding' | 'chat',
    model: any,
  ): Promise<any> {
    const addedModel = configManager.addProviderModel(providerId, type, model);
    return addedModel;
  }

  async removeProviderModel(
    providerId: string,
    type: 'embedding' | 'chat',
    modelKey: string,
  ): Promise<void> {
    configManager.removeProviderModel(providerId, type, modelKey);
    return;
  }
}

export default ModelRegistry;
