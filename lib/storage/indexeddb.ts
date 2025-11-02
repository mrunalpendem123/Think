/**
 * IndexedDB storage layer for chat history
 * Stores encrypted chat data locally in the browser
 */

import { type Chat } from '@/lib/types'

import { decrypt, encrypt } from './encryption'

const DB_NAME = 'private-search-ai'
const DB_VERSION = 1
const CHATS_STORE = 'chats'
const USER_INDEX = 'by_user'
const DATE_INDEX = 'by_date'

/**
 * Opens or creates the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create chats store if it doesn't exist
      if (!db.objectStoreNames.contains(CHATS_STORE)) {
        const store = db.createObjectStore(CHATS_STORE, { keyPath: 'id' })
        
        // Create indexes for efficient querying
        store.createIndex(USER_INDEX, 'userId', { unique: false })
        store.createIndex(DATE_INDEX, 'createdAt', { unique: false })
      }
    }
  })
}

/**
 * Saves a chat to IndexedDB with encryption
 */
export async function saveChat(chat: Chat, userId: string): Promise<void> {
  try {
    const db = await openDatabase()
    
    // Encrypt the messages
    const encryptedMessages = await encrypt(JSON.stringify(chat.messages), userId)
    
    const chatToSave = {
      ...chat,
      userId,
      messages: encryptedMessages,
      encryptedAt: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHATS_STORE], 'readwrite')
      const store = transaction.objectStore(CHATS_STORE)
      const request = store.put(chatToSave)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to save chat:', error)
    throw error
  }
}

/**
 * Retrieves a single chat by ID
 */
export async function getChat(chatId: string, userId: string): Promise<Chat | null> {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHATS_STORE], 'readonly')
      const store = transaction.objectStore(CHATS_STORE)
      const request = store.get(chatId)

      request.onsuccess = async () => {
        const result = request.result
        
        if (!result) {
          resolve(null)
          return
        }

        // Verify the chat belongs to this user
        if (result.userId !== userId) {
          resolve(null)
          return
        }

        try {
          // Decrypt messages
          const decryptedMessages = await decrypt(result.messages, userId)
          const chat: Chat = {
            ...result,
            messages: JSON.parse(decryptedMessages)
          }
          resolve(chat)
        } catch (error) {
          console.error('Failed to decrypt chat:', error)
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
      
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to get chat:', error)
    return null
  }
}

/**
 * Retrieves chats for a user with pagination
 */
export async function getChats(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ chats: Chat[]; nextOffset: number | null }> {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHATS_STORE], 'readonly')
      const store = transaction.objectStore(CHATS_STORE)
      const index = store.index(USER_INDEX)
      const request = index.openCursor(IDBKeyRange.only(userId), 'prev')

      const chats: Chat[] = []
      let count = 0
      let skipped = 0

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (!cursor) {
          // Finished iterating
          const nextOffset = chats.length === limit ? offset + limit : null
          resolve({ chats, nextOffset })
          return
        }

        // Skip items for pagination
        if (skipped < offset) {
          skipped++
          cursor.continue()
          return
        }

        // Collect items up to limit
        if (count < limit) {
          try {
            const result = cursor.value
            const decryptedMessages = await decrypt(result.messages, userId)
            const chat: Chat = {
              ...result,
              messages: JSON.parse(decryptedMessages),
              createdAt: new Date(result.createdAt)
            }
            chats.push(chat)
            count++
            cursor.continue()
          } catch (error) {
            console.error('Failed to decrypt chat during iteration:', error)
            // Skip corrupted chats
            cursor.continue()
          }
        } else {
          // Reached limit
          const nextOffset = offset + limit
          resolve({ chats, nextOffset })
        }
      }

      request.onerror = () => reject(request.error)
      
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to get chats:', error)
    return { chats: [], nextOffset: null }
  }
}

/**
 * Deletes a chat by ID
 */
export async function deleteChat(chatId: string, userId: string): Promise<void> {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHATS_STORE], 'readwrite')
      const store = transaction.objectStore(CHATS_STORE)
      
      // First verify the chat belongs to the user
      const getRequest = store.get(chatId)
      
      getRequest.onsuccess = () => {
        const result = getRequest.result
        
        if (!result || result.userId !== userId) {
          reject(new Error('Chat not found or unauthorized'))
          return
        }

        const deleteRequest = store.delete(chatId)
        deleteRequest.onsuccess = () => resolve()
        deleteRequest.onerror = () => reject(deleteRequest.error)
      }

      getRequest.onerror = () => reject(getRequest.error)
      
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to delete chat:', error)
    throw error
  }
}

/**
 * Clears all chats for a user
 */
export async function clearChats(userId: string): Promise<void> {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHATS_STORE], 'readwrite')
      const store = transaction.objectStore(CHATS_STORE)
      const index = store.index(USER_INDEX)
      const request = index.openCursor(IDBKeyRange.only(userId))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
      
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to clear chats:', error)
    throw error
  }
}

/**
 * Gets all chats for a user (for export)
 */
export async function getAllChats(userId: string): Promise<Chat[]> {
  try {
    const result = await getChats(userId, 999999, 0)
    return result.chats
  } catch (error) {
    console.error('Failed to get all chats:', error)
    return []
  }
}

