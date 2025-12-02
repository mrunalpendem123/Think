import { Message, UserMessage, AssistantMessage } from '@/components/ChatWindow';
import { MinimalProvider } from '@/lib/models/types';

// Type guard to check if message has content property
const hasContent = (msg: Message): msg is UserMessage | AssistantMessage => {
  return (msg.role === 'user' || msg.role === 'assistant') && 'content' in msg;
};

// Helper function to validate and refresh provider config
const validateAndRefreshProviderConfig = async (): Promise<{chatModel: string, chatModelProvider: string} | null> => {
  try {
    // Fetch providers from API
    const res = await fetch(`/api/providers`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[validateAndRefreshProviderConfig] Failed to fetch providers:', res.status);
      return null;
    }

    const data = await res.json();
    const providers: MinimalProvider[] = data.providers;

    if (providers.length === 0) {
      console.error('[validateAndRefreshProviderConfig] No providers available');
      return null;
    }

    // Get current provider IDs from localStorage
    const currentChatModelProviderId = localStorage.getItem('chatModelProviderId');
    const currentChatModelKey = localStorage.getItem('chatModelKey');

    // Check if current provider ID is valid
    const isValidProvider = currentChatModelProviderId && 
      providers.some((p) => p.id === currentChatModelProviderId && p.chatModels.length > 0);

    if (isValidProvider) {
      // Provider ID is valid, check if model key is still valid
      const provider = providers.find((p) => p.id === currentChatModelProviderId);
      if (provider) {
        const isValidModel = provider.chatModels.some((m) => m.key === currentChatModelKey);
        if (isValidModel) {
          // Both provider ID and model key are valid
          return {
            chatModel: currentChatModelKey!,
            chatModelProvider: currentChatModelProviderId!,
          };
        }
      }
    }

    // Provider ID or model key is invalid, refresh with Think AI provider or first available
    console.warn('[validateAndRefreshProviderConfig] Provider ID invalid, refreshing config');
    
    // Prefer Think AI (Venice) provider if available
    const thinkAIProvider = providers.find((p) => p.name === 'Think AI' && p.chatModels.length > 0);
    const chatModelProvider = thinkAIProvider ?? providers.find((p) => p.chatModels.length > 0);

    if (!chatModelProvider) {
      console.error('[validateAndRefreshProviderConfig] No valid chat model providers found');
      return null;
    }

    // Default to Think AI Fast (mistral-31-24b) if available, otherwise first model
    const defaultModel = chatModelProvider.chatModels.find((m) => m.key === 'mistral-31-24b') 
      ?? chatModelProvider.chatModels.find((m) => m.name.includes('Fast'))
      ?? chatModelProvider.chatModels[0];

    const chatModelKey = defaultModel.key;
    const chatModelProviderId = chatModelProvider.id;

    // Update localStorage with valid config
    localStorage.setItem('chatModelKey', chatModelKey);
    localStorage.setItem('chatModelProviderId', chatModelProviderId);

    console.log('[validateAndRefreshProviderConfig] Config refreshed:', {
      chatModelKey,
      chatModelProviderId,
    });

    return {
      chatModel: chatModelKey,
      chatModelProvider: chatModelProviderId,
    };
  } catch (error) {
    console.error('[validateAndRefreshProviderConfig] Error:', error);
    return null;
  }
};

export const getSuggestions = async (chatHistory: Message[]): Promise<string[]> => {
  try {
    // Validate chatHistory
    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      console.warn('[getSuggestions] Invalid chat history provided');
      return [];
    }

    // Validate and refresh provider config if needed
    const providerConfig = await validateAndRefreshProviderConfig();
    if (!providerConfig) {
      console.warn('[getSuggestions] Failed to validate or refresh provider config');
      return [];
    }

    const { chatModel, chatModelProvider } = providerConfig;

    // Filter chat history to only include user and assistant messages with content
    const validHistory = chatHistory
      .filter(hasContent)
      .filter((msg) => 
        msg.content && 
        typeof msg.content === 'string' &&
        msg.content.trim().length > 0
      )
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    if (validHistory.length === 0) {
      console.warn('[getSuggestions] No valid messages in chat history');
      return [];
    }

    const res = await fetch(`/api/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatHistory: validHistory,
        chatModel: {
          providerId: chatModelProvider,
          key: chatModel,
        },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[getSuggestions] API error: ${res.status}`, errorData);
      
      // If error is due to invalid provider ID, try refreshing config once more
      if (res.status === 500 && errorData.data && errorData.data.includes('Invalid provider id')) {
        console.warn('[getSuggestions] Provider ID error detected, attempting config refresh');
        const refreshedConfig = await validateAndRefreshProviderConfig();
        if (refreshedConfig) {
          // Retry once with refreshed config
          const retryRes = await fetch(`/api/suggestions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatHistory: validHistory,
              chatModel: {
                providerId: refreshedConfig.chatModelProvider,
                key: refreshedConfig.chatModel,
              },
            }),
          });
          
          if (retryRes.ok) {
            const retryData = (await retryRes.json()) as { suggestions?: string[] };
            if (retryData && Array.isArray(retryData.suggestions)) {
              return retryData.suggestions;
            }
          }
        }
      }
      
      return [];
    }

    const data = (await res.json()) as { suggestions?: string[] };
    
    // Validate response
    if (!data || !Array.isArray(data.suggestions)) {
      console.warn('[getSuggestions] Invalid response format:', data);
      return [];
    }

    return data.suggestions;
  } catch (error) {
    console.error('[getSuggestions] Error fetching suggestions:', error);
    return [];
  }
};
