import { Message, Section } from '@/lib/hooks/useChat';
import {
  AssistantMessage,
  UserMessage,
  SourceMessage,
  TemplateMessage,
} from '@/components/ChatWindow';

/**
 * Adapter layer to convert between our message format and Crayon's format
 */

export interface CrayonMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  template?: string;
  data?: any;
  timestamp: Date;
}

/**
 * Convert our Message type to Crayon's message format
 */
export function toCrayonMessage(message: Message): CrayonMessage | null {
  const baseMessage = {
    id: message.messageId,
    timestamp: message.createdAt,
  };

  switch (message.role) {
    case 'user':
      return {
        ...baseMessage,
        role: 'user' as const,
        content: (message as UserMessage).content,
      };

    case 'assistant':
      return {
        ...baseMessage,
        role: 'assistant' as const,
        content: (message as AssistantMessage).content,
      };

    case 'template':
      return {
        ...baseMessage,
        role: 'assistant' as const,
        template: (message as TemplateMessage).template,
        data: (message as TemplateMessage).data,
      };

    case 'source':
      // Sources can be rendered as a template
      const sourceMsg = message as SourceMessage;
      return {
        ...baseMessage,
        role: 'assistant' as const,
        template: 'sources',
        data: { sources: sourceMsg.sources },
      };

    case 'suggestion':
      // Skip suggestions in Crayon format for now
      return null;

    default:
      return null;
  }
}

/**
 * Convert an array of our messages to Crayon format
 */
export function toCrayonMessages(messages: Message[]): CrayonMessage[] {
  return messages
    .map(toCrayonMessage)
    .filter((msg): msg is CrayonMessage => msg !== null);
}

/**
 * Convert a Section to Crayon messages (for backward compatibility)
 */
export function sectionToCrayonMessages(section: Section): CrayonMessage[] {
  const messages: CrayonMessage[] = [];

  // Add user message
  messages.push({
    id: section.userMessage.messageId,
    role: 'user',
    content: section.userMessage.content,
    timestamp: section.userMessage.createdAt,
  });

  // Add source message if present
  if (section.sourceMessage && section.sourceMessage.sources.length > 0) {
    messages.push({
      id: section.sourceMessage.messageId,
      role: 'assistant',
      template: 'sources',
      data: { sources: section.sourceMessage.sources },
      timestamp: section.sourceMessage.createdAt,
    });
  }

  // Add assistant message if present
  if (section.assistantMessage) {
    messages.push({
      id: section.assistantMessage.messageId,
      role: 'assistant',
      content: section.parsedAssistantMessage || section.assistantMessage.content,
      timestamp: section.assistantMessage.createdAt,
    });
  }

  return messages;
}

/**
 * Convert all sections to Crayon messages
 */
export function sectionsToCrayonMessages(sections: Section[]): CrayonMessage[] {
  return sections.flatMap(sectionToCrayonMessages);
}

/**
 * Stream handler adapter for Crayon
 */
export interface StreamChunk {
  type: 'content' | 'template' | 'sources' | 'error' | 'done';
  data?: any;
  template?: string;
  content?: string;
}

export function createStreamAdapter(
  onChunk: (chunk: StreamChunk) => void,
): (data: any) => void {
  return (data: any) => {
    if (data.type === 'message') {
      onChunk({
        type: 'content',
        content: data.data,
      });
    } else if (data.type === 'template') {
      onChunk({
        type: 'template',
        template: data.template,
        data: data.data,
      });
    } else if (data.type === 'sources') {
      onChunk({
        type: 'sources',
        data: data.data,
      });
    } else if (data.type === 'error') {
      onChunk({
        type: 'error',
        data: data.data,
      });
    } else if (data.type === 'messageEnd') {
      onChunk({
        type: 'done',
      });
    }
  };
}

