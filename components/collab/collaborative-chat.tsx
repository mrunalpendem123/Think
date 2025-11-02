/**
 * Collaborative AI Chat Component
 * Enables real-time P2P collaboration using Y.js
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { ChatRequestOptions } from 'ai'
import { Message } from 'ai/react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

import { ChatManager, Peer } from '@/lib/p2p/chat-manager'
import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { getOrCreateSessionId } from '@/lib/utils/session'

import { ChatMessages } from '@/components/chat-messages'
import { ChatPanel } from '@/components/chat-panel'

import { ChatControls } from './chat-controls'
import { PresenceIndicator } from './presence-indicator'
import { TypingIndicator } from './typing-indicator'

interface CollaborativeChatProps {
  chatId: string
  models?: Model[]
}

export function CollaborativeChat({ chatId, models }: CollaborativeChatProps) {
  const { address, isConnected } = useAccount()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const chatManagerRef = useRef<ChatManager | null>(null)
  const [peers, setPeers] = useState<Peer[]>([])
  const [isConnecting, setIsConnecting] = useState(true)

  // Get user info
  const getUserId = useCallback(() => {
    if (isConnected && address) {
      return address
    }
    return getOrCreateSessionId()
  }, [isConnected, address])

  const getUserName = useCallback(() => {
    if (isConnected && address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return 'Anonymous'
  }, [isConnected, address])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    stop,
    append,
    data,
    setData,
    addToolResult,
    reload
  } = useChat({
    id: chatId,
    body: { id: chatId },
    onFinish: (message) => {
      // Broadcast BOTH user message and AI response to peers
      console.log('🤖 AI finished, broadcasting messages')
      
      if (chatManagerRef.current) {
        // Get the last two messages (user + assistant)
        const recentMessages = messages.slice(-2)
        
        recentMessages.forEach(msg => {
          console.log(`📤 Broadcasting: ${msg.role} - ${msg.content.substring(0, 50)}...`)
          chatManagerRef.current!.addMessage({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            sender: getUserId(),
            senderName: getUserName(),
            timestamp: Date.now()
          })
        })
        
        // Also broadcast the finished message
        if (message) {
          console.log(`📤 Broadcasting finished message: ${message.content.substring(0, 50)}...`)
          chatManagerRef.current.addMessage({
            id: message.id,
            role: 'assistant',
            content: message.content,
            sender: getUserId(),
            senderName: getUserName(),
            timestamp: Date.now()
          })
        }
      }
    },
    onError: error => {
      toast.error(`Error in chat: ${error.message}`)
    },
    sendExtraMessageFields: false,
    experimental_throttle: 100
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Initialize P2P chat manager
  useEffect(() => {
    let mounted = true
    let manager: ChatManager | null = null

    const initializeP2P = async () => {
      if (!mounted) return

      const userId = getUserId()
      const userName = getUserName()

      console.log('🚀 Initializing P2P (mounted:', mounted, ')')

      manager = new ChatManager(chatId, userId, userName)
      
      try {
        await manager.connect()
        
        if (!mounted) {
          console.log('⚠️ Component unmounted during connect, cleaning up')
          manager.disconnect()
          return
        }

        chatManagerRef.current = manager

        // Listen for messages from peers
        manager.onMessages((collabMessages) => {
          console.log('📨 P2P: Received messages:', collabMessages.length)
          // Convert collaborative messages to AI SDK format
          // Store sender info in experimental_attachments for display
          const uiMessages: Message[] = collabMessages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            experimental_attachments: msg.senderName ? [{
              name: 'sender',
              contentType: 'text/plain',
              url: msg.sender
            }] : undefined
          }))
          setMessages(uiMessages)
        })

        // Listen for peer changes
        manager.onPeersChange((newPeers) => {
          console.log('👥 P2P: Peers updated:', newPeers.length)
          setPeers(newPeers)
        })

        setIsConnecting(false)
        toast.success('Connected to collaborative chat!')
      } catch (error) {
        console.error('❌ P2P: Failed to connect:', error)
        toast.error('Failed to connect to collaborative chat')
        setIsConnecting(false)
      }
    }

    initializeP2P()

    return () => {
      console.log('🧹 Cleanup: Unmounting collaborative chat')
      mounted = false
      if (chatManagerRef.current) {
        chatManagerRef.current.disconnect()
        chatManagerRef.current = null
      }
    }
  }, [chatId, getUserId, getUserName, setMessages])

  // Broadcast typing status
  useEffect(() => {
    if (chatManagerRef.current && input.length > 0) {
      chatManagerRef.current.setTyping(true)
      const timeout = setTimeout(() => {
        chatManagerRef.current?.setTyping(false)
      }, 1000)
      return () => clearTimeout(timeout)
    } else if (chatManagerRef.current) {
      chatManagerRef.current.setTyping(false)
    }
  }, [input])

  // Handle message submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Don't broadcast here - let onFinish handle it after AI processes
    // This prevents duplicate messages
    setData(undefined)
    handleSubmit(e)
  }

  const handleLeave = () => {
    console.log('🚪 handleLeave called in CollaborativeChat')
    if (chatManagerRef.current) {
      console.log('🔌 Disconnecting P2P chat manager')
      chatManagerRef.current.disconnect()
    } else {
      console.warn('⚠️ Chat manager not initialized')
    }
    console.log('🏠 Redirecting to homepage')
    window.location.href = '/'
  }

  const handleReloadFrom = async (
    messageId: string,
    options?: ChatRequestOptions
  ) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      const userMessageIndex = messages
        .slice(0, messageIndex)
        .findLastIndex(m => m.role === 'user')
      if (userMessageIndex !== -1) {
        const trimmedMessages = messages.slice(0, userMessageIndex + 1)
        setMessages(trimmedMessages)
        return await reload(options)
      }
    }
    return await reload(options)
  }

  // Detect if scroll container is at the bottom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 50
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsAtBottom(true)
      } else {
        setIsAtBottom(false)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Convert messages to sections (same as regular chat)
  const sections = []
  let currentSection: any = null

  for (const message of messages) {
    if (message.role === 'user') {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        id: message.id,
        userMessage: message,
        assistantMessages: []
      }
    } else if (currentSection && message.role === 'assistant') {
      currentSection.assistantMessages.push(message)
    }
  }

  if (currentSection) {
    sections.push(currentSection)
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to collaborative chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Collab header */}
      <div className="flex items-center justify-between px-4 py-3 border-b gap-4 flex-shrink-0">
        <PresenceIndicator peers={peers} currentUserName={getUserName()} />
        <ChatControls 
          chatId={chatId} 
          peerCount={peers.length}
          onLeave={handleLeave}
        />
      </div>

      {/* Chat messages - Fixed scrolling */}
      <div className={cn(
        'relative flex-1 overflow-y-auto overflow-x-hidden',
        messages.length === 0 ? 'flex items-center justify-center' : ''
      )}>
        <ChatMessages
          sections={sections}
          data={data}
          onQuerySelect={(query) => append({ role: 'user', content: query })}
          isLoading={isLoading}
          chatId={chatId}
          addToolResult={addToolResult}
          scrollContainerRef={scrollContainerRef}
          onUpdateMessage={async () => {}}
          reload={handleReloadFrom}
        />
      </div>

      {/* Typing indicator */}
      <TypingIndicator peers={peers} />

      {/* Chat input */}
      <ChatPanel
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        stop={stop}
        query=""
        append={append}
        models={models}
        showScrollToBottomButton={!isAtBottom}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  )
}

