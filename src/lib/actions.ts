import { Message, UserMessage, AssistantMessage } from '@/components/ChatWindow';

// Type guard to check if message has content property
const hasContent = (msg: Message): msg is UserMessage | AssistantMessage => {
  return (msg.role === 'user' || msg.role === 'assistant') && 'content' in msg;
};

export const getSuggestions = async (chatHistory: Message[]): Promise<string[]> => {
  try {
    // Validate chatHistory
    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      console.warn('[getSuggestions] Invalid chat history provided');
      return [];
    }

    // Get model configuration from localStorage
    const chatModel = localStorage.getItem('chatModelKey');
    const chatModelProvider = localStorage.getItem('chatModelProviderId');

    // Validate model configuration exists
    if (!chatModel || !chatModelProvider) {
      console.warn('[getSuggestions] Chat model not configured in localStorage');
      return [];
    }

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
