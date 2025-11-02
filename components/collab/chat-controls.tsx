/**
 * Collaborative chat controls
 * Share, join, and leave collaborative chats
 */

'use client'

import { useState } from 'react'

import { Check, Copy, ExternalLink, LogOut, Share2, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChatControlsProps {
  chatId: string
  peerCount: number
  onLeave: () => void
}

export function ChatControls({ chatId, peerCount, onLeave }: ChatControlsProps) {
  const [copied, setCopied] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const chatUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/collab/${chatId}`
    : ''

  const handleCopyLink = async () => {
    console.log('📋 Copy button clicked, URL:', chatUrl)
    try {
      await navigator.clipboard.writeText(chatUrl)
      setCopied(true)
      toast.success('Chat link copied!')
      console.log('✅ Link copied successfully')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('❌ Copy failed:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleLeave = () => {
    console.log('🚪 Leave button clicked')
    if (confirm('Leave this collaborative chat? You can rejoin with the link.')) {
      console.log('✅ User confirmed leave')
      onLeave()
      toast.success('Left collaborative chat')
    } else {
      console.log('❌ User cancelled leave')
    }
  }

  return (
    <div className="flex items-center gap-2 z-10 pointer-events-auto">
      {/* Peer count badge */}
      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
        <Users size={12} />
        <span>{peerCount + 1}</span>
      </div>

      {/* Share button */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 cursor-pointer pointer-events-auto z-10"
            onClick={(e) => {
              console.log('🖱️ Share button clicked!')
              e.stopPropagation()
            }}
          >
            <Share2 size={14} />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Collaborative Chat</DialogTitle>
            <DialogDescription>
              Anyone with this link can join and participate in this AI chat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chat Link</Label>
              <div className="flex gap-2">
                <Input
                  value={chatUrl}
                  readOnly
                  className="flex-1"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-yellow-900 dark:text-yellow-200">
                <strong>Privacy Notice:</strong> All participants will see your messages and AI responses. Only share with trusted users.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-destructive hover:text-destructive"
        onClick={handleLeave}
      >
        <LogOut size={14} />
        Leave
      </Button>
    </div>
  )
}

