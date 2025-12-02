'use client';

import {
  AssistantMessage,
  ChatTurn,
  Message,
  SourceMessage,
  SuggestionMessage,
  TemplateMessage,
  UserMessage,
} from '@/components/ChatWindow';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// Generate random hex string (client-side compatible)
const randomHex = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};
import { useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getSuggestions } from '../actions';
import { MinimalProvider } from '../models/types';
import { getAutoMediaSearch } from '../config/clientRegistry';
import {
  getChat,
  getMessages,
  saveChat,
  saveMessage,
  deleteMessagesAfter,
} from '../db/indexeddb';

export type Section = {
  userMessage: UserMessage;
  assistantMessage: AssistantMessage | undefined;
  parsedAssistantMessage: string | undefined;
  speechMessage: string | undefined;
  sourceMessage: SourceMessage | undefined;
  thinkingEnded: boolean;
  suggestions?: string[];
};

type ChatContext = {
  messages: Message[];
  chatTurns: ChatTurn[];
  sections: Section[];
  chatHistory: [string, string][];
  files: File[];
  fileIds: string[];
  focusMode: string;
  chatId: string | undefined;
  optimizationMode: string;
  isMessagesLoaded: boolean;
  loading: boolean;
  notFound: boolean;
  messageAppeared: boolean;
  isReady: boolean;
  hasError: boolean;
  chatModelProvider: ChatModelProvider;
  embeddingModelProvider: EmbeddingModelProvider;
  replyingTo: Section | null;
  replyingToText: string | null;
  setOptimizationMode: (mode: string) => void;
  setFocusMode: (mode: string) => void;
  setFiles: (files: File[]) => void;
  setFileIds: (fileIds: string[]) => void;
  sendMessage: (
    message: string,
    messageId?: string,
    rewrite?: boolean,
  ) => Promise<void>;
  rewrite: (messageId: string) => void;
  setReplyingTo: (section: Section | null, selectedText?: string) => void;
  setChatModelProvider: (provider: ChatModelProvider) => void;
  setEmbeddingModelProvider: (provider: EmbeddingModelProvider) => void;
};

export interface File {
  fileName: string;
  fileExtension: string;
  fileId: string;
}

interface ChatModelProvider {
  key: string;
  providerId: string;
}

interface EmbeddingModelProvider {
  key: string;
  providerId: string;
}

const checkConfig = async (
  setChatModelProvider: (provider: ChatModelProvider) => void,
  setEmbeddingModelProvider: (provider: EmbeddingModelProvider) => void,
  setIsConfigReady: (ready: boolean) => void,
  setHasError: (hasError: boolean) => void,
) => {
  try {
    let chatModelKey = localStorage.getItem('chatModelKey');
    let chatModelProviderId = localStorage.getItem('chatModelProviderId');
    let embeddingModelKey = localStorage.getItem('embeddingModelKey');
    let embeddingModelProviderId = localStorage.getItem(
      'embeddingModelProviderId',
    );

    const res = await fetch(`/api/providers`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(
        `Provider fetching failed with status code ${res.status}`,
      );
    }

    const data = await res.json();
    const providers: MinimalProvider[] = data.providers;

    if (providers.length === 0) {
      throw new Error(
        'No chat model providers found, please configure them in the settings page.',
      );
    }

    // Prefer Think AI (Venice) provider if available
    const thinkAIProvider = providers.find((p) => p.name === 'Think AI' && p.chatModels.length > 0);
    const chatModelProvider =
      providers.find((p) => p.id === chatModelProviderId) ??
      thinkAIProvider ??
      providers.find((p) => p.chatModels.length > 0);

    if (!chatModelProvider) {
      throw new Error(
        'No chat models found, pleae configure them in the settings page.',
      );
    }

    chatModelProviderId = chatModelProvider.id;

    // Default to Think AI Fast (mistral-31-24b) if available, otherwise first model
    const defaultModel = chatModelProvider.chatModels.find((m) => m.key === 'mistral-31-24b') 
      ?? chatModelProvider.chatModels.find((m) => m.name.includes('Fast'))
      ?? chatModelProvider.chatModels[0];
    
    const chatModel =
      chatModelProvider.chatModels.find((m) => m.key === chatModelKey) ??
      defaultModel;
    chatModelKey = chatModel.key;

    // Prefer Think AI (Venice) provider for embeddings if available
    const thinkAIEmbeddingProvider = providers.find((p) => p.name === 'Think AI' && p.embeddingModels.length > 0);
    const embeddingModelProvider =
      providers.find((p) => p.id === embeddingModelProviderId) ??
      thinkAIEmbeddingProvider ??
      providers.find((p) => p.embeddingModels.length > 0);

    if (!embeddingModelProvider) {
      throw new Error(
        'No embedding models found, pleae configure them in the settings page.',
      );
    }

    embeddingModelProviderId = embeddingModelProvider.id;

    // Default to Think AI Text Embedding 3 Small if available, otherwise first model
    const defaultEmbeddingModel = embeddingModelProvider.embeddingModels.find((m) => m.key === 'text-embedding-3-small')
      ?? embeddingModelProvider.embeddingModels.find((m) => m.name.includes('Small'))
      ?? embeddingModelProvider.embeddingModels[0];
    
    const embeddingModel =
      embeddingModelProvider.embeddingModels.find(
        (m) => m.key === embeddingModelKey,
      ) ?? defaultEmbeddingModel;
    embeddingModelKey = embeddingModel.key;

    localStorage.setItem('chatModelKey', chatModelKey);
    localStorage.setItem('chatModelProviderId', chatModelProviderId);
    localStorage.setItem('embeddingModelKey', embeddingModelKey);
    localStorage.setItem('embeddingModelProviderId', embeddingModelProviderId);

    setChatModelProvider({
      key: chatModelKey,
      providerId: chatModelProviderId,
    });

    setEmbeddingModelProvider({
      key: embeddingModelKey,
      providerId: embeddingModelProviderId,
    });

    setIsConfigReady(true);
  } catch (err: any) {
    console.error('An error occurred while checking the configuration:', err);
    toast.error(err.message);
    setIsConfigReady(false);
    setHasError(true);
  }
};

const loadMessages = async (
  chatId: string,
  setMessages: (messages: Message[]) => void,
  setIsMessagesLoaded: (loaded: boolean) => void,
  setChatHistory: (history: [string, string][]) => void,
  setFocusMode: (mode: string) => void,
  setNotFound: (notFound: boolean) => void,
  setFiles: (files: File[]) => void,
  setFileIds: (fileIds: string[]) => void,
) => {
  try {
    const chat = await getChat(chatId);
    
    if (!chat) {
      setNotFound(true);
      setIsMessagesLoaded(true);
      return;
    }

    const messages = await getMessages(chatId);
    
    // Convert createdAt strings to Date objects, handling both string and Date types
    const convertedMessages = messages.map((msg: any) => {
      let createdAt: Date;
      if (msg.createdAt instanceof Date) {
        createdAt = msg.createdAt;
      } else if (typeof msg.createdAt === 'string') {
        createdAt = new Date(msg.createdAt);
      } else {
        createdAt = new Date();
      }
      
      return {
        ...msg,
        createdAt,
      };
    }) as unknown as Message[];

    setMessages(convertedMessages);

    const chatTurns = convertedMessages.filter(
      (msg): msg is ChatTurn => msg.role === 'user' || msg.role === 'assistant',
    );

    const history = chatTurns.map((msg) => {
      const role = msg.role === 'user' ? 'human' : 'ai';
      return [role, msg.content || ''];
    }) as [string, string][];

    console.debug(new Date(), 'app:messages_loaded');

    if (chatTurns.length > 0) {
      document.title = chatTurns[0].content || 'Think Fast';
    }

    const files = (chat.files || []).map((file: any) => {
      return {
        fileName: file.name,
        fileExtension: file.name.split('.').pop(),
        fileId: file.fileId,
      };
    });

    setFiles(files);
    setFileIds(files.map((file: File) => file.fileId));

    setChatHistory(history);
    setFocusMode(chat.focusMode);
    setIsMessagesLoaded(true);
  } catch (error) {
    console.error('Error loading messages from IndexedDB:', error);
    setNotFound(true);
    setIsMessagesLoaded(true);
  }
};

export const chatContext = createContext<ChatContext>({
  chatHistory: [],
  chatId: '',
  fileIds: [],
  files: [],
  focusMode: '',
  hasError: false,
  isMessagesLoaded: false,
  isReady: false,
  loading: false,
  messageAppeared: false,
  messages: [],
  chatTurns: [],
  sections: [],
  notFound: false,
  optimizationMode: '',
  chatModelProvider: { key: '', providerId: '' },
  embeddingModelProvider: { key: '', providerId: '' },
  replyingTo: null,
  replyingToText: null,
  rewrite: () => {},
  sendMessage: async () => {},
  setFileIds: () => {},
  setFiles: () => {},
  setFocusMode: () => {},
  setOptimizationMode: () => {},
  setReplyingTo: () => {},
  setChatModelProvider: () => {},
  setEmbeddingModelProvider: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const params: { chatId: string } = useParams();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('q');

  const [chatId, setChatId] = useState<string | undefined>(params.chatId);
  const [newChatCreated, setNewChatCreated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [messageAppeared, setMessageAppeared] = useState(false);

  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);

  const [focusMode, setFocusMode] = useState('webSearch');
  const [optimizationMode, setOptimizationMode] = useState('speed');
  const [replyingTo, setReplyingToState] = useState<Section | null>(null);
  const [replyingToText, setReplyingToText] = useState<string | null>(null);

  const setReplyingTo = (section: Section | null, selectedText?: string) => {
    console.log('🟣 setReplyingTo called');
    console.log('🟣 section:', section ? 'YES' : 'NO');
    console.log('🟣 selectedText:', selectedText ? selectedText.slice(0, 50) + '...' : 'NO');
    setReplyingToState(section);
    setReplyingToText(selectedText || null);
  };

  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  const [notFound, setNotFound] = useState(false);

  const [chatModelProvider, setChatModelProvider] = useState<ChatModelProvider>(
    {
      key: '',
      providerId: '',
    },
  );

  const [embeddingModelProvider, setEmbeddingModelProvider] =
    useState<EmbeddingModelProvider>({
      key: '',
      providerId: '',
    });

  const [isConfigReady, setIsConfigReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const messagesRef = useRef<Message[]>([]);

  const chatTurns = useMemo((): ChatTurn[] => {
    if (!Array.isArray(messages)) {
      return [];
    }
    return messages.filter(
      (msg): msg is ChatTurn => msg.role === 'user' || msg.role === 'assistant',
    );
  }, [messages]);

  const sections = useMemo<Section[]>(() => {
    const sections: Section[] = [];

    // Ensure messages is an array before processing
    if (!Array.isArray(messages) || messages.length === 0) {
      return sections;
    }

    messages.forEach((msg, i) => {
      if (msg.role === 'user') {
        const nextUserMessageIndex = messages.findIndex(
          (m, j) => j > i && m.role === 'user',
        );

        const aiMessage = messages.find(
          (m, j) =>
            j > i &&
            m.role === 'assistant' &&
            (nextUserMessageIndex === -1 || j < nextUserMessageIndex),
        ) as AssistantMessage | undefined;

        const sourceMessage = messages.find(
          (m, j) =>
            j > i &&
            m.role === 'source' &&
            m.sources &&
            (nextUserMessageIndex === -1 || j < nextUserMessageIndex),
        ) as SourceMessage | undefined;

        let thinkingEnded = false;
        let processedMessage = aiMessage?.content ?? '';
        let speechMessage = aiMessage?.content ?? '';
        let suggestions: string[] = [];

        if (aiMessage) {
          const citationRegex = /\[([^\]]+)\]/g;
          const regex = /\[(\d+)\]/g;

          if (processedMessage.includes('<think>')) {
            const openThinkTag =
              processedMessage.match(/<think>/g)?.length || 0;
            const closeThinkTag =
              processedMessage.match(/<\/think>/g)?.length || 0;

            if (openThinkTag && !closeThinkTag) {
              processedMessage += '</think> <a> </a>';
            }
          }

          if (aiMessage.content.includes('</think>')) {
            thinkingEnded = true;
          }

          if (
            sourceMessage &&
            sourceMessage.sources &&
            Array.isArray(sourceMessage.sources) &&
            sourceMessage.sources.length > 0
          ) {
            processedMessage = processedMessage.replace(
              citationRegex,
              (_, capturedContent: string) => {
                const numbers = capturedContent
                  .split(',')
                  .map((numStr) => numStr.trim());

                const linksHtml = numbers
                  .map((numStr) => {
                    const number = parseInt(numStr);

                    if (isNaN(number) || number <= 0) {
                      return `[${numStr}]`;
                    }

                    const source = sourceMessage.sources?.[number - 1];
                    const url = source?.metadata?.url;

                    if (url) {
                      return `<citation href="${url}">${numStr}</citation>`;
                    } else {
                      return ``;
                    }
                  })
                  .join('');

                return linksHtml;
              },
            );
            speechMessage = aiMessage.content.replace(regex, '');
          } else {
            processedMessage = processedMessage.replace(regex, '');
            speechMessage = aiMessage.content.replace(regex, '');
          }

          const suggestionMessage = messages.find(
            (m, j) =>
              j > i &&
              m.role === 'suggestion' &&
              (nextUserMessageIndex === -1 || j < nextUserMessageIndex),
          ) as SuggestionMessage | undefined;

          if (
            suggestionMessage &&
            suggestionMessage.suggestions &&
            Array.isArray(suggestionMessage.suggestions) &&
            suggestionMessage.suggestions.length > 0
          ) {
            suggestions = suggestionMessage.suggestions;
          }
        }

        sections.push({
          userMessage: msg,
          assistantMessage: aiMessage,
          sourceMessage: sourceMessage,
          parsedAssistantMessage: processedMessage,
          speechMessage,
          thinkingEnded,
          suggestions: suggestions,
        });
      }
    });

    return sections;
  }, [messages]);

  useEffect(() => {
    checkConfig(
      setChatModelProvider,
      setEmbeddingModelProvider,
      setIsConfigReady,
      setHasError,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (params.chatId && params.chatId !== chatId) {
      setChatId(params.chatId);
      setMessages([]);
      setChatHistory([]);
      setFiles([]);
      setFileIds([]);
      setIsMessagesLoaded(false);
      setNotFound(false);
      setNewChatCreated(false);
    }
  }, [params.chatId, chatId]);

  useEffect(() => {
    if (
      chatId &&
      !newChatCreated &&
      !isMessagesLoaded &&
      messages.length === 0
    ) {
      loadMessages(
        chatId,
        setMessages,
        setIsMessagesLoaded,
        setChatHistory,
        setFocusMode,
        setNotFound,
        setFiles,
        setFileIds,
      );
    } else if (!chatId && !params.chatId) {
      // Only create new chat if we're on home page (no chatId in URL)
      setNewChatCreated(true);
      setIsMessagesLoaded(true);
      setMessages([]);
      setChatHistory([]);
      setFiles([]);
      setFileIds([]);
      setChatId(randomHex(40));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, isMessagesLoaded, newChatCreated, messages.length]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isMessagesLoaded && isConfigReady) {
      setIsReady(true);
      console.debug(new Date(), 'app:ready');
    } else {
      setIsReady(false);
    }
  }, [isMessagesLoaded, isConfigReady]);

  const rewrite = (messageId: string) => {
    const index = messages.findIndex((msg) => msg.messageId === messageId);
    const chatTurnsIndex = chatTurns.findIndex(
      (msg) => msg.messageId === messageId,
    );

    if (index === -1) return;

    const message = chatTurns[chatTurnsIndex - 1];

    setMessages((prev) => {
      return [
        ...prev.slice(0, messages.length > 2 ? messages.indexOf(message) : 0),
      ];
    });
    setChatHistory((prev) => {
      return [...prev.slice(0, chatTurns.length > 2 ? chatTurnsIndex - 1 : 0)];
    });

    sendMessage(message.content, message.messageId, true);
  };

  useEffect(() => {
    if (isReady && initialMessage && isConfigReady) {
      if (!isConfigReady) {
        toast.error('Cannot send message before the configuration is ready');
        return;
      }
      sendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigReady, isReady, initialMessage]);

  const sendMessage: ChatContext['sendMessage'] = async (
    message,
    messageId,
    rewrite = false,
  ) => {
    if (loading || !message) return;
    
    console.log('🟢 sendMessage called');
    console.log('🟢 replyingTo state:', replyingTo);
    console.log('🟢 replyingToText state:', replyingToText);
    console.log('🟢 message:', message);
    
    setLoading(true);
    setMessageAppeared(false);

    if (messages.length <= 1) {
      window.history.replaceState(null, '', `/c/${chatId}`);
    }

    let recievedMessage = '';
    let added = false;
    let assistantMessageId: string | null = null;

    messageId = messageId ?? randomHex(14);

    // Save user message to IndexedDB
    await saveMessage({
      messageId: messageId,
      chatId: chatId!,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    });

    // Save/update chat
    const chatExists = await getChat(chatId!);
    if (!chatExists) {
      await saveChat({
        id: chatId!,
        title: message,
        createdAt: new Date().toISOString(),
        focusMode: focusMode,
        files: files.map((f) => ({ name: f.fileName, fileId: f.fileId })),
      });
    }

    // Handle rewrite - delete messages after the message being rewritten
    if (rewrite) {
      const messageIndex = messages.findIndex((m) => m.messageId === messageId);
      if (messageIndex !== -1) {
        await deleteMessagesAfter(chatId!, messageId);
      }
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: message,
        messageId: messageId,
        chatId: chatId!,
        role: 'user',
        createdAt: new Date(),
      },
    ]);

    const messageHandler = async (data: any) => {
      if (data.type === 'error') {
        toast.error(data.data);
        setLoading(false);
        return;
      }

      if (data.type === 'sources') {
        // Ensure data.data is an array
        const sources = Array.isArray(data.data) ? data.data : [];
        
        // Save source message to IndexedDB
        await saveMessage({
          messageId: data.messageId,
          chatId: chatId!,
          role: 'source',
          sources: sources,
          createdAt: new Date().toISOString(),
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            messageId: data.messageId,
            chatId: chatId!,
            role: 'source',
            sources: sources,
            createdAt: new Date(),
          },
        ]);
        if (sources.length > 0) {
          setMessageAppeared(true);
        }
      }

      if (data.type === 'template') {
        // Save template message to IndexedDB
        await saveMessage({
          messageId: data.messageId,
          chatId: chatId!,
          role: 'template',
          template: data.template,
          data: data.data,
          createdAt: new Date(),
        } as TemplateMessage);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            messageId: data.messageId,
            chatId: chatId!,
            role: 'template',
            template: data.template,
            data: data.data,
            createdAt: new Date(),
          },
        ]);
        setMessageAppeared(true);
      }

      if (data.type === 'message') {
        // Ensure data.data is a string
        const messageData = typeof data.data === 'string' ? data.data : String(data.data || '');
        
        if (!added) {
          assistantMessageId = data.messageId;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: messageData,
              messageId: data.messageId,
              chatId: chatId!,
              role: 'assistant',
              createdAt: new Date(),
            },
          ]);
          added = true;
          setMessageAppeared(true);
        } else {
          setMessages((prev) =>
            prev.map((message) => {
              if (
                message.messageId === data.messageId &&
                message.role === 'assistant'
              ) {
                const currentContent = typeof message.content === 'string' ? message.content : '';
                return { ...message, content: currentContent + messageData };
              }

              return message;
            }),
          );
        }
        recievedMessage += messageData;
      }

      if (data.type === 'messageEnd') {
        // Save assistant message to IndexedDB
        await saveMessage({
          messageId: assistantMessageId || data.messageId || randomHex(14),
          chatId: chatId!,
          role: 'assistant',
          content: recievedMessage,
          createdAt: new Date().toISOString(),
        });

        setChatHistory((prevHistory) => [
          ...prevHistory,
          ['human', message],
          ['assistant', recievedMessage],
        ]);

        setLoading(false);

        const lastMsg = messagesRef.current[messagesRef.current.length - 1];

        const autoMediaSearch = getAutoMediaSearch();

        if (autoMediaSearch) {
          document
            .getElementById(`search-images-${lastMsg.messageId}`)
            ?.click();

          document
            .getElementById(`search-videos-${lastMsg.messageId}`)
            ?.click();
        }

        /* Check if there are sources after message id's index and no suggestions */

        const userMessageIndex = messagesRef.current.findIndex(
          (msg) => msg.messageId === messageId && msg.role === 'user',
        );

        const sourceMessage = messagesRef.current.find(
          (msg, i) => i > userMessageIndex && msg.role === 'source',
        ) as SourceMessage | undefined;

        const suggestionMessageIndex = messagesRef.current.findIndex(
          (msg, i) => i > userMessageIndex && msg.role === 'suggestion',
        );

        if (
          sourceMessage &&
          sourceMessage.sources &&
          Array.isArray(sourceMessage.sources) &&
          sourceMessage.sources.length > 0 &&
          suggestionMessageIndex == -1
        ) {
          try {
            const suggestions = await getSuggestions(messagesRef.current);
            // Only add suggestions if we got valid ones
            if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
              setMessages((prev) => {
                return [
                  ...prev,
                  {
                    role: 'suggestion',
                    suggestions: suggestions,
                    chatId: chatId!,
                    createdAt: new Date(),
                    messageId: randomHex(14),
                  },
                ];
              });
            }
          } catch (error) {
            console.error('[useChat] Error fetching suggestions:', error);
            // Silently fail - suggestions are optional
          }
        }
      }
    };

    const messageIndex = messages.findIndex((m) => m.messageId === messageId);

    // Prepend reply context to message if replying
    let messageWithContext = message;
    if (replyingTo && !rewrite) {
      let replyContext = '';
      
      if (replyingToText) {
        // If specific text was selected, use that
        replyContext = `[Replying to this part: "${replyingToText}"]\n\n${message}`;
        console.log('✅ Sending reply with selected text:', replyingToText.slice(0, 100) + '...');
      } else {
        // Otherwise, use the full message context
        replyContext = `[Replying to: "${replyingTo.userMessage.content.slice(0, 100)}${replyingTo.userMessage.content.length > 100 ? '...' : ''}"]${replyingTo.assistantMessage ? `\n[Previous answer: "${replyingTo.assistantMessage.content.slice(0, 200)}${replyingTo.assistantMessage.content.length > 200 ? '...' : ''}"]` : ''}\n\n${message}`;
        console.log('✅ Sending reply with full message context');
      }
      
      messageWithContext = replyContext;
      console.log('📤 Full message being sent to AI:', messageWithContext);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageWithContext,
          message: {
            messageId: messageId,
            chatId: chatId!,
            content: message, // Store original message without context
          },
          chatId: chatId!,
          files: fileIds || [],
          focusMode: focusMode || 'webSearch',
          optimizationMode: optimizationMode || 'speed',
          history: rewrite
            ? chatHistory.slice(0, messageIndex === -1 ? undefined : messageIndex)
            : chatHistory || [],
          chatModel: {
            key: chatModelProvider.key || '',
            providerId: chatModelProvider.providerId || '',
          },
          embeddingModel: {
            key: embeddingModelProvider.key || '',
            providerId: embeddingModelProvider.providerId || '',
          },
          systemInstructions: localStorage.getItem('systemInstructions') || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || `API error: ${res.status}`);
        setLoading(false);
        return;
      }

      if (!res.body) {
        toast.error('No response body from server');
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        toast.error('Failed to get response reader');
        setLoading(false);
        return;
      }
      
      const decoder = new TextDecoder('utf-8');

      let partialChunk = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partialChunk += decoder.decode(value, { stream: true });

        try {
          const messages = partialChunk.split('\n');
          for (const msg of messages) {
            if (!msg.trim()) continue;
            const json = JSON.parse(msg);
            messageHandler(json);
          }
          partialChunk = '';
        } catch (error) {
          console.warn('Incomplete JSON, waiting for next chunk...');
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  return (
    <chatContext.Provider
      value={{
        messages,
        chatTurns,
        sections,
        chatHistory,
        files,
        fileIds,
        focusMode,
        chatId,
        hasError,
        isMessagesLoaded,
        isReady,
        loading,
        messageAppeared,
        notFound,
        optimizationMode,
        replyingTo,
        replyingToText,
        setFileIds,
        setFiles,
        setFocusMode,
        setOptimizationMode,
        setReplyingTo,
        rewrite,
        sendMessage,
        setChatModelProvider,
        chatModelProvider,
        embeddingModelProvider,
        setEmbeddingModelProvider,
      }}
    >
      {children}
    </chatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(chatContext);
  return ctx;
};
