/**
 * P2P utility functions
 * Safe for server-side rendering
 */

/**
 * Generate a shareable collaborative chat ID
 */
export function generateCollabChatId(): string {
  return `collab-${crypto.randomUUID()}`
}

