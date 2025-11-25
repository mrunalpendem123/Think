/**
 * P2P Chat Manager using Y.js and WebRTC
 * Enables real-time collaborative AI chats with multiple users
 */

import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

export interface CollaborativeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sender: string
  senderName?: string
  timestamp: number
}

export interface Peer {
  id: string
  name: string
  color: string
  isTyping: boolean
}

// Track active rooms to prevent duplicates
const activeRooms = new Map<string, ChatManager>()

export class ChatManager {
  private ydoc: Y.Doc | null = null
  private provider: WebrtcProvider | null = null
  private chatId: string
  private userId: string
  private userName: string
  private messages: Y.Array<CollaborativeMessage> | null = null
  private awareness: any = null
  private isConnected: boolean = false

  constructor(chatId: string, userId: string, userName: string) {
    this.chatId = chatId
    this.userId = userId
    this.userName = userName
  }

  /**
   * Initialize the collaborative chat
   */
  async connect() {
    // Check if already connected
    if (this.isConnected) {
      console.log('⚠️ P2P: Already connected, skipping')
      return
    }

    // Check if room already exists
    const existing = activeRooms.get(this.chatId)
    if (existing && existing !== this) {
      console.log('⚠️ P2P: Room already exists, disconnecting old instance')
      existing.disconnect()
    }

    console.log('🔗 P2P: Initializing connection...')
    console.log('   Chat ID:', this.chatId)
    console.log('   User ID:', this.userId)
    console.log('   User Name:', this.userName)

    // Create Y.js document
    this.ydoc = new Y.Doc()
    console.log('📄 Y.js document created')

    // Get or create messages array
    this.messages = this.ydoc.getArray<CollaborativeMessage>('messages')
    console.log('📨 Messages array initialized')

    // Create WebRTC provider for P2P sync
    console.log('🌐 Creating WebRTC provider...')
    this.provider = new WebrtcProvider(this.chatId, this.ydoc, {
      signaling: [
        'wss://demos.yjs.dev', // Working demo server
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-iygjqp4gqa-uc.a.run.app' // Google Cloud backup
      ],
      password: this.chatId, // Use chat ID as password for encryption
      awareness: new (await import('y-protocols/awareness')).Awareness(this.ydoc),
      maxConns: 20, // Max 20 peers
      filterBcConns: true,
      peerOpts: {}
    })

    this.awareness = this.provider.awareness
    this.isConnected = true

    // Register this instance
    activeRooms.set(this.chatId, this)

    // Set local user state
    this.awareness.setLocalState({
      user: {
        id: this.userId,
        name: this.userName,
        color: this.generateUserColor()
      },
      isTyping: false
    })

    // Log connection events
    this.provider.on('status', (event: any) => {
      console.log('📡 WebRTC Status:', event.status)
    })

    this.provider.on('peers', (event: any) => {
      console.log('👥 Peers changed:', event.added, 'added,', event.removed, 'removed')
      console.log('   Total peers connected:', (this.provider as any)?.peers?.size || 0)
    })

    console.log('✅ P2P: Connected to chat:', this.chatId)
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
    if (!this.isConnected) {
      console.log('⚠️ P2P: Not connected, skipping disconnect')
      return
    }

    console.log('🔌 P2P: Disconnecting from chat:', this.chatId)

    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }
    if (this.ydoc) {
      this.ydoc.destroy()
      this.ydoc = null
    }
    
    this.awareness = null
    this.messages = null
    this.isConnected = false

    // Unregister this instance
    activeRooms.delete(this.chatId)

    console.log('✅ P2P: Disconnected from chat:', this.chatId)
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


