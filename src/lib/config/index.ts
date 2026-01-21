import path from 'node:path';
import fs from 'fs';
import { Config, ConfigModelProvider, UIConfigSections } from './types';
import { hashObj } from '../serverUtils';
import { getModelProvidersUIConfigSection } from '../models/providers';

class ConfigManager {
  configPath: string = path.join(
    process.env.DATA_DIR || process.cwd(),
    '/data/config.json',
  );
  configVersion = 1;
  currentConfig: Config = {
    version: this.configVersion,
    setupComplete: false,
    preferences: {},
    personalization: {},
    modelProviders: [],
    search: {
      searxngURL: '',
      searxngFallbackURL: '',
      searxngFallbackURLs: [],
      parallelAPIKey: '',
      newsAPIKey: '',
      brightDataAPIKey: '',
    },
  };
  uiConfigSections: UIConfigSections = {
    preferences: [
      {
        name: 'Theme',
        key: 'theme',
        type: 'select',
        options: [
          {
            name: 'Light',
            value: 'light',
          },
          {
            name: 'Dark',
            value: 'dark',
          },
        ],
        required: false,
        description: 'Choose between light and dark layouts for the app.',
        default: 'dark',
        scope: 'client',
      },
      {
        name: 'Measurement Unit',
        key: 'measureUnit',
        type: 'select',
        options: [
          {
            name: 'Imperial',
            value: 'Imperial',
          },
          {
            name: 'Metric',
            value: 'Metric',
          },
        ],
        required: false,
        description: 'Choose between Metric  and Imperial measurement unit.',
        default: 'Metric',
        scope: 'client',
      },
      {
        name: 'Auto video & image search',
        key: 'autoMediaSearch',
        type: 'switch',
        required: false,
        description: 'Automatically search for relevant images and videos.',
        default: true,
        scope: 'client',
      },
    ],
    personalization: [
      {
        name: 'System Instructions',
        key: 'systemInstructions',
        type: 'textarea',
        required: false,
        description: 'Add custom behavior or tone for the model.',
        placeholder:
          'e.g., "Respond in a friendly and concise tone" or "Use British English and format answers as bullet points."',
        scope: 'client',
      },
    ],
    modelProviders: [],
    search: [
      {
        name: 'SearXNG URL',
        key: 'searxngURL',
        type: 'string',
        required: false,
        description: 'Primary SearXNG instance URL for discover feature. You can use a public instance from https://searx.space/ or self-host your own.',
        placeholder: 'https://search.rhscz.eu',
        default: '',
        scope: 'server',
        env: 'SEARXNG_API_URL',
      },
      {
        name: 'SearXNG Fallback URL',
        key: 'searxngFallbackURL',
        type: 'string',
        required: false,
        description: 'Primary fallback SearXNG instance URL (optional). Used if primary instance fails or is rate-limited.',
        placeholder: 'https://another-searx-instance.com',
        default: '',
        scope: 'server',
        env: 'SEARXNG_FALLBACK_URL',
      },
      {
        name: 'Additional SearXNG Fallback URLs',
        key: 'searxngFallbackURLs',
        type: 'string',
        required: false,
        description: 'Additional fallback SearXNG instance URLs (optional). Multiple instances can be configured for better reliability.',
        placeholder: 'https://instance1.com,https://instance2.com',
        default: '',
        scope: 'server',
        env: 'SEARXNG_FALLBACK_URLS',
      },
      {
        name: 'NewsAPI Key',
        key: 'newsAPIKey',
        type: 'password',
        required: false,
        description: 'Your NewsAPI key for discover feature (https://newsapi.org). Recommended for better news discovery.',
        placeholder: 'NewsAPI Key',
        default: '',
        scope: 'server',
        env: 'NEWSAPI_KEY',
      },
      {
        name: 'BrightData API Key',
        key: 'brightDataAPIKey',
        type: 'password',
        required: false,
        description: 'Your BrightData API key for web search (https://brightdata.com). Used for SERP API to get search results.',
        placeholder: 'BrightData API Key',
        default: '',
        scope: 'server',
        env: 'BRIGHTDATA_API_KEY',
      },
      {
        name: 'Parallel AI API Key',
        key: 'parallelAPIKey',
        type: 'password',
        required: false,
        description: 'Your Parallel AI API key for web search',
        placeholder: 'Parallel AI API Key',
        default: '',
        scope: 'server',
        env: 'PARALLEL_API_KEY',
      },
    ],
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.initializeConfig();
    this.initializeFromEnv();
  }

  private saveConfig() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.currentConfig, null, 2),
      );
    } catch (error) {
      // On Vercel or other read-only filesystems, config writes may fail
      // Log warning but don't throw - use in-memory config only
      console.warn('Could not save config to file system (read-only?):', error);
    }
  }

  private initializeConfig() {
    try {
      const exists = fs.existsSync(this.configPath);
      if (!exists) {
        // Try to create config file, but don't fail if filesystem is read-only
        try {
          const dir = path.dirname(this.configPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(
            this.configPath,
            JSON.stringify(this.currentConfig, null, 2),
          );
        } catch (writeError) {
          console.warn('Could not create config file (read-only filesystem?):', writeError);
          // Continue with default config in memory
        }
      } else {
        try {
          this.currentConfig = JSON.parse(
            fs.readFileSync(this.configPath, 'utf-8'),
          );
        } catch (err) {
          if (err instanceof SyntaxError) {
            console.error(
              `Error parsing config file at ${this.configPath}:`,
              err,
            );
            console.log(
              'Loading default config and overwriting the existing file.',
            );
            try {
              fs.writeFileSync(
                this.configPath,
                JSON.stringify(this.currentConfig, null, 2),
              );
            } catch (writeError) {
              console.warn('Could not overwrite config file:', writeError);
            }
            return;
          } else {
            console.log('Unknown error reading config file:', err);
          }
        }

        this.currentConfig = this.migrateConfig(this.currentConfig);
      }
    } catch (error) {
      // If filesystem operations fail entirely (e.g., on Vercel), use default config
      console.warn('Config file system access failed, using default config:', error);
      // Continue with default config in memory
    }
  }

  private migrateConfig(config: Config): Config {
    /* TODO: Add migrations */
    return config;
  }

  private initializeFromEnv() {
    /* providers section*/
    const providerConfigSections = getModelProvidersUIConfigSection();

    this.uiConfigSections.modelProviders = providerConfigSections;

    const newProviders: ConfigModelProvider[] = [];

    providerConfigSections.forEach((provider) => {
      // Use Think AI branding for Venice AI provider
      const providerName = provider.key === 'venice' ? 'Think AI' : provider.name;
      
      const newProvider: ConfigModelProvider & { required?: string[] } = {
        id: crypto.randomUUID(),
        name: providerName,
        type: provider.key,
        chatModels: [],
        embeddingModels: [],
        config: {},
        required: [],
        hash: '',
      };

      provider.fields.forEach((field) => {
        // Auto-configure Venice AI with hardcoded API key
        if (provider.key === 'venice' && field.key === 'apiKey') {
          newProvider.config[field.key] = process.env[field.env!] || '5veQ8IP7eF-x9xvpn-XK0vQPvRC3L8QoyDW-q8o1pX';
        } else if (provider.key === 'venice' && field.key === 'baseURL') {
          newProvider.config[field.key] = process.env[field.env!] || field.default || 'https://api.venice.ai/api/v1';
        } else {
          newProvider.config[field.key] =
            process.env[field.env!] ||
            field.default ||
            ''; /* Env var must exist for providers */
        }

        if (field.required) newProvider.required?.push(field.key);
      });

      let configured = true;

      newProvider.required?.forEach((r) => {
        if (!newProvider.config[r]) {
          configured = false;
        }
      });

      // For Venice, always consider it configured since we auto-set the API key
      if (configured || (provider.key === 'venice' && newProvider.config.apiKey)) {
        const hash = hashObj(newProvider.config);
        newProvider.hash = hash;
        delete newProvider.required;

        const exists = this.currentConfig.modelProviders.find(
          (p) => p.hash === hash,
        );

        if (!exists) {
          // Auto-add default models for Venice AI if configured
          if (provider.key === 'venice') {
            // Add default chat models with Think AI branding and response times
            newProvider.chatModels = [
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
            // Add default embedding models with Think AI branding
            newProvider.embeddingModels = [
              {
                name: 'Think AI - Text Embedding 3 Small',
                key: 'text-embedding-3-small',
              },
              {
                name: 'Think AI - Text Embedding 3 Large',
                key: 'text-embedding-3-large',
              },
            ];
          }
          newProviders.push(newProvider);
        }
      }
    });

    this.currentConfig.modelProviders.push(...newProviders);

    // Ensure existing Venice AI providers have models if they don't and update name
    this.currentConfig.modelProviders.forEach((provider) => {
      // Update provider name to Think AI if it's Venice AI or Think Fast
      if (provider.type === 'venice' && (provider.name === 'Venice AI' || provider.name === 'Think Fast')) {
        provider.name = 'Think AI';
      }
      
      // Update model names to Think AI branding with response times
      if (provider.type === 'venice') {
        // Map old model names to new Think AI names with response times
        const modelNameMap: Record<string, string> = {
          'qwen3-4b': '(2-3s) Think AI Lite',
          'mistral-31-24b': '(3-4s) Think AI Fast',
          'llama-3.3-70b': '(4-5s) Think AI Standard',
          'qwen3-235b': '(8-10s) Think AI Pro',
        };
        
        // Update chat models - filter out venice-uncensored and update names
        provider.chatModels = provider.chatModels
          .filter((model) => model.key !== 'venice-uncensored')
          .map((model) => {
            // If we have a mapping for this key, use it
            if (modelNameMap[model.key]) {
              return { ...model, name: modelNameMap[model.key] };
            }
            // Otherwise keep existing name if it already has Think AI
            if (model.name.includes('Think AI')) {
              return model;
            }
            return model;
          });
        
        // Update embedding models
        provider.embeddingModels = provider.embeddingModels.map((model) => {
          if (!model.name.includes('Think AI')) {
            return { ...model, name: `Think AI - ${model.name.replace(/^Think Fast - /, '')}` };
          }
          return model;
        });
        
        // Add models if empty
        if (provider.chatModels.length === 0) {
          provider.chatModels = [
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
          provider.embeddingModels = [
            {
              name: 'Think AI - Text Embedding 3 Small',
              key: 'text-embedding-3-small',
            },
            {
              name: 'Think AI - Text Embedding 3 Large',
              key: 'text-embedding-3-large',
            },
          ];
        }
      }
    });

    /* search section */
    this.uiConfigSections.search.forEach((f) => {
      if (f.env && !this.currentConfig.search[f.key]) {
        const envValue = process.env[f.env];
        // Handle searxngFallbackURLs as comma-separated string that gets split into array
        if (f.key === 'searxngFallbackURLs' && envValue) {
          this.currentConfig.search[f.key] = envValue.split(',').map((url: string) => url.trim()).filter(Boolean);
        } else {
          this.currentConfig.search[f.key] = envValue ?? f.default ?? '';
        }
      }
    });

    // Auto-mark setup as complete if Venice AI is configured (Venice is always auto-configured)
    // Also check if Venice was just added in this initialization
    const hasVeniceAI = this.currentConfig.modelProviders.some(
      (p) => p.type === 'venice' && p.config.apiKey && p.chatModels.length > 0,
    );
    
    // If Venice AI is configured but setup is not complete, mark it complete
    if (hasVeniceAI && !this.currentConfig.setupComplete) {
      this.currentConfig.setupComplete = true;
      console.log('Auto-configuration complete: Venice AI is configured');
      // Set cookie for Vercel compatibility
      if (typeof process !== 'undefined' && process.env.VERCEL) {
        // Cookie will be set by the API route when setup completes
      }
    }

    this.saveConfig();
  }

  public getConfig(key: string, defaultValue?: any): any {
    const nested = key.split('.');
    let obj: any = this.currentConfig;

    for (let i = 0; i < nested.length; i++) {
      const part = nested[i];
      if (obj == null) return defaultValue;

      obj = obj[part];
    }

    return obj === undefined ? defaultValue : obj;
  }

  public updateConfig(key: string, val: any) {
    const parts = key.split('.');
    if (parts.length === 0) return;

    let target: any = this.currentConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (target[part] === null || typeof target[part] !== 'object') {
        target[part] = {};
      }

      target = target[part];
    }

    const finalKey = parts[parts.length - 1];
    target[finalKey] = val;

    this.saveConfig();
  }

  public addModelProvider(type: string, name: string, config: any) {
    const newModelProvider: ConfigModelProvider = {
      id: crypto.randomUUID(),
      name,
      type,
      config,
      chatModels: [],
      embeddingModels: [],
      hash: hashObj(config),
    };

    this.currentConfig.modelProviders.push(newModelProvider);
    this.saveConfig();

    return newModelProvider;
  }

  public removeModelProvider(id: string) {
    const index = this.currentConfig.modelProviders.findIndex(
      (p) => p.id === id,
    );

    if (index === -1) return;

    this.currentConfig.modelProviders =
      this.currentConfig.modelProviders.filter((p) => p.id !== id);

    this.saveConfig();
  }

  public async updateModelProvider(id: string, name: string, config: any) {
    const provider = this.currentConfig.modelProviders.find((p) => {
      return p.id === id;
    });

    if (!provider) throw new Error('Provider not found');

    provider.name = name;
    provider.config = config;

    this.saveConfig();

    return provider;
  }

  public addProviderModel(
    providerId: string,
    type: 'embedding' | 'chat',
    model: any,
  ) {
    const provider = this.currentConfig.modelProviders.find(
      (p) => p.id === providerId,
    );

    if (!provider) throw new Error('Invalid provider id');

    delete model.type;

    if (type === 'chat') {
      provider.chatModels.push(model);
    } else {
      provider.embeddingModels.push(model);
    }

    this.saveConfig();

    return model;
  }

  public removeProviderModel(
    providerId: string,
    type: 'embedding' | 'chat',
    modelKey: string,
  ) {
    const provider = this.currentConfig.modelProviders.find(
      (p) => p.id === providerId,
    );

    if (!provider) throw new Error('Invalid provider id');

    if (type === 'chat') {
      provider.chatModels = provider.chatModels.filter(
        (m) => m.key !== modelKey,
      );
    } else {
      provider.embeddingModels = provider.embeddingModels.filter(
        (m) => m.key != modelKey,
      );
    }

    this.saveConfig();
  }

  public isSetupComplete() {
    // Check cookie first (for Vercel where filesystem is read-only)
    // This is checked in the layout component via cookies()
    return this.currentConfig.setupComplete;
  }

  public markSetupComplete() {
    if (!this.currentConfig.setupComplete) {
      this.currentConfig.setupComplete = true;
    }

    // On Vercel, filesystem is read-only, so saveConfig will fail silently
    // But we can still mark as complete in memory
    this.saveConfig();
    
    // Also set an environment variable flag for Vercel
    if (process.env.VERCEL) {
      process.env.SETUP_COMPLETE = 'true';
    }
  }

  public getUIConfigSections(): UIConfigSections {
    return this.uiConfigSections;
  }

  public getCurrentConfig(): Config {
    return JSON.parse(JSON.stringify(this.currentConfig));
  }
}

const configManager = new ConfigManager();

export default configManager;
