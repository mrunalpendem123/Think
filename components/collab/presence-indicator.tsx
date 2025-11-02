/**
 * Presence indicator showing active users in collaborative chat
 */

'use client'

import { Users } from 'lucide-react'

import { Peer } from '@/lib/p2p/chat-manager'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface PresenceIndicatorProps {
  peers: Peer[]
  currentUserName: string
}

export function PresenceIndicator({ peers, currentUserName }: PresenceIndicatorProps) {
  const totalUsers = peers.length + 1 // +1 for current user

  if (totalUsers === 1) {
    return null // Don't show if alone
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
        <Users size={14} className="text-muted-foreground" />
        <div className="flex -space-x-2">
          {/* Current user */}
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="size-6 border-2 border-background">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  You
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentUserName} (You)</p>
            </TooltipContent>
          </Tooltip>

          {/* Other peers */}
          {peers.slice(0, 5).map((peer) => (
            <Tooltip key={peer.id}>
              <TooltipTrigger>
                <Avatar className="size-6 border-2 border-background">
                  <AvatarFallback
                    className="text-xs"
                    style={{ backgroundColor: peer.color }}
                  >
                    {peer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{peer.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Show count if more than 5 peers */}
          {peers.length > 5 && (
            <Avatar className="size-6 border-2 border-background">
              <AvatarFallback className="text-xs bg-muted-foreground text-background">
                +{peers.length - 5}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
        </span>
      </div>
    </TooltipProvider>
  )
}

