import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Model, ModelList, ProviderMetadata } from '../types';
import BaseModelProvider from './baseProvider';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Embeddings } from '@langchain/core/embeddings';
import { UIConfigField } from '@/lib/config/types';
import { getConfiguredModelProviderById } from '@/lib/config/serverRegistry';

interface VeniceConfig {
  apiKey: string;
  baseURL: string;
}

const defaultChatModels: Model[] = [
  {
    name: '(2-3s) Think AI Lite',
    key: 'qwen3-4b',
  },
  {
    name: '(3-4s) Think AI Fast',
    key: 'mistral-31-24b',
  },
  {
    name: '(4-5s) Think AI Standard',
    key: 'llama-3.3-70b',
  },
  {
    name: '(8-10s) Think AI Pro',
    key: 'qwen3-235b',
  },
];

const defaultEmbeddingModels: Model[] = [
  {
    name: 'Think AI - Text Embedding 3 Small',
    key: 'text-embedding-3-small',
  },
  {
    name: 'Think AI - Text Embedding 3 Large',
    key: 'text-embedding-3-large',
  },
];

const providerConfigFields: UIConfigField[] = [
  {
    type: 'password',
    name: 'API Key',
    key: 'apiKey',
    description: 'Your Venice AI API key',
    required: true,
    placeholder: 'Venice AI API Key',
    env: 'VENICE_API_KEY',
    scope: 'server',
  },
  {
    type: 'string',
    name: 'Base URL',
    key: 'baseURL',
    description: 'The base URL for the Venice AI API',
    required: true,
    placeholder: 'Venice AI Base URL',
    default: 'https://api.venice.ai/api/v1',
    env: 'VENICE_BASE_URL',
    scope: 'server',
  },
];

class VeniceProvider extends BaseModelProvider<VeniceConfig> {
  constructor(id: string, name: string, config: VeniceConfig) {
    super(id, name, config);
  }

  async getDefaultModels(): Promise<ModelList> {
    return {
      embedding: defaultEmbeddingModels,
      chat: defaultChatModels,
    };
  }

  async getModelList(): Promise<ModelList> {
    const defaultModels = await this.getDefaultModels();
    const configProvider = getConfiguredModelProviderById(this.id)!;

    // Use configProvider models if they exist, otherwise use defaults
    // This prevents duplicates when models are auto-added to config
    const chatModels = configProvider.chatModels.length > 0
      ? configProvider.chatModels
      : defaultModels.chat;
    
    const embeddingModels = configProvider.embeddingModels.length > 0
      ? configProvider.embeddingModels
      : defaultModels.embedding;

    return {
      embedding: embeddingModels,
      chat: chatModels,
    };
  }

  async loadChatModel(key: string): Promise<BaseChatModel> {
    try {
      console.log('[VeniceProvider] Loading chat model:', { key, apiKey: this.config.apiKey ? '***' : 'MISSING', baseURL: this.config.baseURL });
      
      const modelList = await this.getModelList();
      console.log('[VeniceProvider] Available chat models:', modelList.chat.map(m => m.key));

      const exists = modelList.chat.find((m) => m.key === key);

      if (!exists) {
        console.error('[VeniceProvider] Model not found:', { requested: key, available: modelList.chat.map(m => m.key) });
        throw new Error(
          `Error Loading Venice AI Chat Model. Invalid Model Selected: ${key}. Available models: ${modelList.chat.map(m => m.key).join(', ')}`,
        );
      }

      if (!this.config.apiKey) {
        throw new Error('Venice AI API key is missing');
      }

      if (!this.config.baseURL) {
        throw new Error('Venice AI base URL is missing');
      }

      const model = new ChatOpenAI({
        apiKey: this.config.apiKey,
        temperature: 0.7,
        model: key,
        configuration: {
          baseURL: this.config.baseURL,
        },
      });
      
      console.log('[VeniceProvider] Chat model created successfully');
      return model;
    } catch (error) {
      console.error('[VeniceProvider] Error in loadChatModel:', error);
      throw error;
    }
  }

  async loadEmbeddingModel(key: string): Promise<Embeddings> {
    try {
      console.log('[VeniceProvider] Loading embedding model:', { key, apiKey: this.config.apiKey ? '***' : 'MISSING', baseURL: this.config.baseURL });
      
      const modelList = await this.getModelList();
      console.log('[VeniceProvider] Available embedding models:', modelList.embedding.map(m => m.key));
      
      const exists = modelList.embedding.find((m) => m.key === key);

      if (!exists) {
        console.error('[VeniceProvider] Embedding model not found:', { requested: key, available: modelList.embedding.map(m => m.key) });
        throw new Error(
          `Error Loading Venice AI Embedding Model. Invalid Model Selected: ${key}. Available models: ${modelList.embedding.map(m => m.key).join(', ')}`,
        );
      }

      if (!this.config.apiKey) {
        throw new Error('Venice AI API key is missing');
      }

      if (!this.config.baseURL) {
        throw new Error('Venice AI base URL is missing');
      }

      const model = new OpenAIEmbeddings({
        apiKey: this.config.apiKey,
        model: key,
        configuration: {
          baseURL: this.config.baseURL,
        },
      });
      
      console.log('[VeniceProvider] Embedding model created successfully');
      return model;
    } catch (error) {
      console.error('[VeniceProvider] Error in loadEmbeddingModel:', error);
      throw error;
    }
  }

  static parseAndValidate(raw: any): VeniceConfig {
    if (!raw || typeof raw !== 'object')
      throw new Error('Invalid config provided. Expected object');
    if (!raw.apiKey || !raw.baseURL)
      throw new Error(
        'Invalid config provided. API key and base URL must be provided',
      );

    return {
      apiKey: String(raw.apiKey),
      baseURL: String(raw.baseURL),
    };
  }

  static getProviderConfigFields(): UIConfigField[] {
    return providerConfigFields;
  }

  static getProviderMetadata(): ProviderMetadata {
    return {
      key: 'venice',
      name: 'Think AI',
    };
  }
}

export default VeniceProvider;

