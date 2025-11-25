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

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
        <Users size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">
          {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
        </span>
      </div>
      
      {totalUsers > 1 && (
        <TooltipProvider>
          <div className="flex -space-x-2">
            {/* Current user */}
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="size-7 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {currentUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentUserName} (You)</p>
              </TooltipContent>
            </Tooltip>

            {/* Other peers */}
            {peers.slice(0, 3).map((peer) => (
              <Tooltip key={peer.id}>
                <TooltipTrigger>
                  <Avatar className="size-7 border-2 border-background">
                    <AvatarFallback
                      className="text-xs text-white"
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

            {/* Show count if more than 3 peers */}
            {peers.length > 3 && (
              <Avatar className="size-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted-foreground text-white">
                  +{peers.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}

