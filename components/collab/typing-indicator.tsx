/**
 * Typing indicator for collaborative chat
 */

'use client'

import { Peer } from '@/lib/p2p/chat-manager'

interface TypingIndicatorProps {
  peers: Peer[]
}

export function TypingIndicator({ peers }: TypingIndicatorProps) {
  const typingPeers = peers.filter(p => p.isTyping)

  console.log('⌨️ Typing Indicator - Total peers:', peers.length, 'Typing:', typingPeers.length)
  
  if (typingPeers.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (typingPeers.length === 1) {
      return `${typingPeers[0].name} is typing...`
    } else if (typingPeers.length === 2) {
      return `${typingPeers[0].name} and ${typingPeers[1].name} are typing...`
    } else {
      return `${typingPeers.length} people are typing...`
    }
  }

  console.log('⌨️ Showing typing:', getTypingText())

  return (
    <div className="flex items-center gap-2 px-6 py-2 text-sm text-muted-foreground border-t flex-shrink-0">
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
          •
        </span>
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}

