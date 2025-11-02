/**
 * Client-side chat actions using IndexedDB
 * All chat data is stored locally in the browser with encryption
 */

import { type Chat } from '@/lib/types'
import * as storage from '@/lib/storage/indexeddb'

/**
 * Gets all chats for a user with pagination
 */
export async function getChats(
  userId?: string | null
): Promise<Chat[]> {
  if (!userId) {
    return []
  }

  try {
    const result = await storage.getChats(userId, 999999, 0)
    return result.chats
  } catch (error) {
    console.error('Error getting chats:', error)
    return []
  }
}

/**
 * Gets a paginated list of chats
 */
export async function getChatsPage(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ chats: Chat[]; nextOffset: number | null }> {
  try {
    return await storage.getChats(userId, limit, offset)
  } catch (error) {
    console.error('Error fetching chat page:', error)
    return { chats: [], nextOffset: null }
  }
}

/**
 * Gets a single chat by ID
 */
export async function getChat(
  id: string,
  userId: string = 'anonymous'
): Promise<Chat | null> {
  try {
    return await storage.getChat(id, userId)
  } catch (error) {
    console.error('Error getting chat:', error)
    return null
  }
}

/**
 * Clears all chats for a user
 */
export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  try {
    await storage.clearChats(userId)
    
    // Dispatch event to refresh UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('chat-history-updated'))
    }
    
    return {}
  } catch (error) {
    console.error('Error clearing chats:', error)
    return { error: 'Failed to clear chat history' }
  }
}

/**
 * Deletes a single chat
 */
export async function deleteChat(
  chatId: string,
  userId = 'anonymous'
): Promise<{ error?: string }> {
  try {
    await storage.deleteChat(chatId, userId)
    
    // Dispatch event to refresh UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('chat-history-updated'))
    }
    
    return {}
  } catch (error) {
    console.error('Error deleting chat:', error)
    return { error: 'Failed to delete chat' }
  }
}

/**
 * Saves a chat to IndexedDB
 */
export async function saveChat(
  chat: Chat,
  userId: string = 'anonymous'
): Promise<void> {
  try {
    await storage.saveChat(chat, userId)
  } catch (error) {
    console.error('Error saving chat:', error)
    throw error
  }
}

/**
 * Gets a shared chat (not applicable for local storage)
 * Returns null as sharing requires server-side storage
 */
export async function getSharedChat(id: string): Promise<Chat | null> {
  console.warn('Chat sharing is not available with local storage')
  return null
}

/**
 * Shares a chat (not applicable for local storage)
 * Returns error as sharing requires server-side storage
 */
export async function shareChat(
  id: string,
  userId: string = 'anonymous'
): Promise<{ error?: string } | null> {
  console.warn('Chat sharing is not available with local storage')
  return {
    error: 'Chat sharing is not available with local storage. Please export your chat history instead.'
  }
}
