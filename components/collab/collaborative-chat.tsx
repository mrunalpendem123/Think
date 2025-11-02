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
  const broadcastedMessagesRef = useRef<Set<string>>(new Set())
  const isReceivingRef = useRef(false)

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
    onError: error => {
      toast.error(`Error in chat: ${error.message}`)
    },
    sendExtraMessageFields: false,
    experimental_throttle: 100
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Broadcast messages AFTER they update in React state
  useEffect(() => {
    if (!chatManagerRef.current || messages.length === 0 || isReceivingRef.current) {
      return
    }

    console.log('💬 Messages updated, checking for new messages to broadcast')
    console.log('   Total messages:', messages.length)
    console.log('   Broadcasted count:', broadcastedMessagesRef.current.size)

    // Find messages that haven't been broadcast yet
    messages.forEach(msg => {
      if (!broadcastedMessagesRef.current.has(msg.id)) {
        console.log(`📤 Broadcasting NEW message: [${msg.role}] ${msg.content.substring(0, 50)}...`)
        
        chatManagerRef.current!.addMessage({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          sender: getUserId(),
          senderName: getUserName(),
          timestamp: Date.now()
        })
        
        broadcastedMessagesRef.current.add(msg.id)
        console.log(`✅ Broadcasted message ${msg.id}`)
      }
    })
  }, [messages, getUserId, getUserName])

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
          console.log('📨 P2P: Received', collabMessages.length, 'messages from peers')
          
          // Set flag to prevent re-broadcasting received messages
          isReceivingRef.current = true
          
          // Convert collaborative messages to AI SDK format
          const uiMessages: Message[] = collabMessages.map(msg => {
            console.log(`  📥 Message from ${msg.senderName}: [${msg.role}] ${msg.content.substring(0, 30)}...`)
            
            // Mark as already broadcast
            broadcastedMessagesRef.current.add(msg.id)
            
            return {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              experimental_attachments: msg.senderName ? [{
                name: 'sender',
                contentType: 'text/plain',
                url: msg.sender
              }] : undefined
            }
          })
          
          setMessages(uiMessages)
          
          // Reset flag after a short delay
          setTimeout(() => {
            isReceivingRef.current = false
          }, 100)
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
      console.log('⌨️ User is typing...')
      chatManagerRef.current.setTyping(true)
      const timeout = setTimeout(() => {
        console.log('⌨️ Typing stopped')
        chatManagerRef.current?.setTyping(false)
      }, 1000)
      return () => clearTimeout(timeout)
    } else if (chatManagerRef.current && input.length === 0) {
      console.log('⌨️ Input cleared, stop typing')
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
      {/* Collab header - Liveblocks style */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
        {/* Left: Presence */}
        <div className="flex items-center gap-3">
          <PresenceIndicator peers={peers} currentUserName={getUserName()} />
        </div>
        
        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <ChatControls 
            chatId={chatId} 
            peerCount={peers.length}
            onLeave={handleLeave}
          />
        </div>
      </div>

      {/* Chat messages - Fixed scrolling */}
      <div 
        ref={scrollContainerRef}
        className={cn(
          'relative flex-1 overflow-y-auto overflow-x-hidden px-4 py-4',
          messages.length === 0 ? 'flex items-center justify-center' : ''
        )}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">Collaborative Chat Started!</p>
            <p className="text-sm">Share the link to invite others to join this conversation.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => {
              const senderInfo = message.experimental_attachments?.find(a => a.name === 'sender')
              const senderId = senderInfo?.url || ''
              const isCurrentUser = senderId === getUserId()
              
              // Get sender name from peers or use current user
              let senderName = 'Anonymous'
              let senderColor = '#6B7280'
              
              if (isCurrentUser) {
                senderName = getUserName()
                senderColor = '#6366f1'
              } else {
                const peer = peers.find(p => p.id === senderId)
                if (peer) {
                  senderName = peer.name
                  senderColor = peer.color
                }
              }
              
              return (
                <div key={message.id} className={cn(
                  'flex flex-col gap-1',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}>
                  {/* Sender name for user messages */}
                  {message.role === 'user' && (
                    <div className="px-3">
                      <span
                        className="text-xs font-medium"
                        style={{ color: senderColor }}
                      >
                        {isCurrentUser ? `${senderName} (You)` : senderName}
                      </span>
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 max-w-[75%] break-words',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* AI label */}
                  {message.role === 'assistant' && (
                    <div className="px-3">
                      <span className="text-xs text-muted-foreground">
                        AI Assistant
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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

