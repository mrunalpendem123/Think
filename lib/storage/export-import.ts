/**
 * Export and import functionality for chat history
 * Allows users to backup and restore their chat history
 */

import { type Chat } from '@/lib/types'

import { getAllChats, saveChat } from './indexeddb'

interface ExportData {
  version: string
  timestamp: string
  userId: string
  chatsCount: number
  chats: Chat[]
}

/**
 * Exports all chats for a user as a JSON file
 */
export async function exportChats(userId: string): Promise<void> {
  try {
    const chats = await getAllChats(userId)

    const exportData: ExportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId,
      chatsCount: chats.length,
      chats
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Create download link
    const a = document.createElement('a')
    a.href = url
    a.download = `private-search-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export chats:', error)
    throw new Error('Failed to export chat history')
  }
}

/**
 * Imports chats from a JSON file
 */
export async function importChats(file: File, userId: string): Promise<number> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as ExportData

    // Validate structure
    if (!data.version || !data.chats || !Array.isArray(data.chats)) {
      throw new Error('Invalid export file format')
    }

    // Import each chat
    let importedCount = 0
    for (const chat of data.chats) {
      try {
        // Ensure the chat has required fields
        if (!chat.id || !chat.messages) {
          console.warn('Skipping invalid chat:', chat)
          continue
        }

        // Save with the current userId (re-encrypt for this user)
        await saveChat(chat, userId)
        importedCount++
      } catch (error) {
        console.error('Failed to import chat:', chat.id, error)
      }
    }

    // Dispatch event to refresh UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('chat-history-updated'))
    }

    return importedCount
  } catch (error) {
    console.error('Failed to import chats:', error)
    throw new Error('Failed to import chat history')
  }
}

