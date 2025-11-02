/**
 * Collaborative chat message with sender info
 */

'use client'

import { Message } from 'ai/react'

import { cn } from '@/lib/utils'

interface CollabMessageProps {
  message: Message
  senderName?: string
  senderColor?: string
  isCurrentUser?: boolean
}

export function CollabMessage({
  message,
  senderName = 'Anonymous',
  senderColor = '#6B7280',
  isCurrentUser = false
}: CollabMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex flex-col gap-1 mb-4', isUser ? 'items-end' : 'items-start')}>
      {/* Sender name */}
      {isUser && (
        <div className="flex items-center gap-2 px-3">
          <span
            className="text-xs font-medium"
            style={{ color: isCurrentUser ? '#6366f1' : senderColor }}
          >
            {isCurrentUser ? `${senderName} (You)` : senderName}
          </span>
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {/* AI label */}
      {!isUser && (
        <div className="flex items-center gap-2 px-3">
          <span className="text-xs text-muted-foreground">
            AI Assistant
          </span>
        </div>
      )}
    </div>
  )
}

