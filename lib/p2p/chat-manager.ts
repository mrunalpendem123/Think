/**
 * P2P Chat Manager using Y.js and WebRTC
 * Enables real-time collaborative AI chats with multiple users
 */

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export interface CollaborativeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sender: string
  timestamp: number
}

export interface Peer {
  id: string
  name: string
  color: string
  isTyping: boolean
}

export class ChatManager {
  private ydoc: Y.Doc | null = null
  private provider: WebrtcProvider | null = null
  private chatId: string
  private userId: string
  private userName: string
  private messages: Y.Array<CollaborativeMessage> | null = null
  private awareness: any = null

  constructor(chatId: string, userId: string, userName: string) {
    this.chatId = chatId
    this.userId = userId
    this.userName = userName
  }

  /**
   * Initialize the collaborative chat
   */
  async connect() {
    // Create Y.js document
    this.ydoc = new Y.Doc()

    // Get or create messages array
    this.messages = this.ydoc.getArray<CollaborativeMessage>('messages')

    // Create WebRTC provider for P2P sync
    this.provider = new WebrtcProvider(this.chatId, this.ydoc, {
      signaling: [
        'wss://signaling.yjs.dev', // Free public signaling server
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ],
      password: this.chatId, // Use chat ID as password for encryption
      awareness: new (await import('y-protocols/awareness')).Awareness(this.ydoc),
      maxConns: 20, // Max 20 peers
      filterBcConns: true,
      peerOpts: {}
    })

    this.awareness = this.provider.awareness

    // Set local user state
    this.awareness.setLocalState({
      user: {
        id: this.userId,
        name: this.userName,
        color: this.generateUserColor()
      },
      isTyping: false
    })

    console.log('🔗 P2P: Connected to chat:', this.chatId)
  }

  /**
   * Add a message to the shared document
   */
  addMessage(message: CollaborativeMessage) {
    if (!this.messages) return

    this.messages.push([message])
    console.log('📤 P2P: Broadcast message:', message.id)
  }

  /**
   * Listen for new messages
   */
  onMessages(callback: (messages: CollaborativeMessage[]) => void) {
    if (!this.messages) return

    // Initial messages
    callback(this.messages.toArray())

    // Listen for changes
    this.messages.observe(() => {
      callback(this.messages!.toArray())
    })
  }

  /**
   * Get active peers
   */
  getPeers(): Peer[] {
    if (!this.awareness) return []

    const peers: Peer[] = []
    this.awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.user && clientId !== this.awareness.clientID) {
        peers.push({
          id: state.user.id,
          name: state.user.name,
          color: state.user.color,
          isTyping: state.isTyping || false
        })
      }
    })

    return peers
  }

  /**
   * Listen for peer changes
   */
  onPeersChange(callback: (peers: Peer[]) => void) {
    if (!this.awareness) return

    callback(this.getPeers())

    this.awareness.on('change', () => {
      callback(this.getPeers())
    })
  }

  /**
   * Set typing status
   */
  setTyping(isTyping: boolean) {
    if (!this.awareness) return

    this.awareness.setLocalStateField('isTyping', isTyping)
  }

  /**
   * Disconnect from the chat
   */
  disconnect() {
    if (this.provider) {
      this.provider.destroy()
    }
    if (this.ydoc) {
      this.ydoc.destroy()
    }
    console.log('🔌 P2P: Disconnected from chat:', this.chatId)
  }

  /**
   * Generate a unique color for each user
   */
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ]
    const hash = this.userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }
}

/**
 * Generate a shareable chat ID
 */
export function generateCollabChatId(): string {
  return `collab-${crypto.randomUUID()}`
}

