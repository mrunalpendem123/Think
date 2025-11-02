/**
 * Dialog to join an existing collaborative chat
 */

'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { UserPlus } from 'lucide-react'
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

export function JoinCollabDialog() {
  const [open, setOpen] = useState(false)
  const [chatLink, setChatLink] = useState('')
  const router = useRouter()

  const handleJoin = () => {
    try {
      // Extract chat ID from URL
      const url = new URL(chatLink)
      const pathParts = url.pathname.split('/')
      const chatId = pathParts[pathParts.length - 1]

      if (!chatId || !chatId.startsWith('collab-')) {
        throw new Error('Invalid collaborative chat link')
      }

      router.push(`/collab/${chatId}`)
      setOpen(false)
      setChatLink('')
    } catch (error) {
      toast.error('Invalid chat link. Please paste a valid collaborative chat URL.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus size={16} />
          Join Collaborative Chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Collaborative Chat</DialogTitle>
          <DialogDescription>
            Paste the chat link shared by another user to join their collaborative AI chat
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-link">Chat Link</Label>
            <Input
              id="chat-link"
              placeholder="https://your-domain.com/collab/collab-abc123..."
              value={chatLink}
              onChange={(e) => setChatLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatLink.trim()) {
                  handleJoin()
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleJoin} disabled={!chatLink.trim()} className="flex-1">
              Join Chat
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

