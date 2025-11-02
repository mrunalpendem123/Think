/**
 * Button to create a new collaborative chat
 */

'use client'

import { useRouter } from 'next/navigation'

import { Users } from 'lucide-react'

import { generateCollabChatId } from '@/lib/p2p/chat-manager'

import { Button } from '@/components/ui/button'

export function CreateCollabButton() {
  const router = useRouter()

  const handleCreateCollab = () => {
    const chatId = generateCollabChatId()
    router.push(`/collab/${chatId}`)
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleCreateCollab}
    >
      <Users size={16} />
      Start Collaborative Chat
    </Button>
  )
}

