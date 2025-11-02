'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

import { deleteChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/utils/session'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

import { Spinner } from '../ui/spinner'

interface ChatMenuItemProps {
  chat: Chat
}

const formatDateWithTime = (date: Date | string) => {
  const parsedDate = new Date(date)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(parsedDate)}`
  } else if (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(parsedDate)}`
  } else {
    return parsedDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
}

export function ChatMenuItem({ chat }: ChatMenuItemProps) {
  const { address, isConnected } = useAccount()
  const pathname = usePathname()
  const isActive = pathname === chat.path
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getUserId = () => {
    if (isConnected && address) {
      return address
    }
    return getOrCreateSessionId()
  }

  const onDelete = () => {
    startTransition(async () => {
      try {
        const userId = getUserId()
        const res = await deleteChat(chat.id, userId)

        if (res.error) {
          throw new Error(res.error)
        }

        toast.success('Chat deleted')
        setIsMenuOpen(false)
        setDialogOpen(false)

        // If deleting the currently active chat, navigate home
        if (isActive) {
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
        toast.error((error as Error).message || 'Failed to delete chat')
        setIsMenuOpen(false)
        setDialogOpen(false)
      }
    })
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="h-auto flex-col gap-0.5 items-start p-2 pr-8"
      >
        <Link href={chat.path}>
          <div className="text-xs font-medium truncate select-none w-full">
            {chat.title}
          </div>
          <div className="text-xs text-muted-foreground w-full">
            {formatDateWithTime(chat.createdAt)}
          </div>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction disabled={isPending} className="size-7 p-1 mr-1">
            {isPending ? (
              <div className="flex items-center justify-center size-full">
                <Spinner />
              </div>
            ) : (
              <MoreHorizontal size={16} />
            )}
            <span className="sr-only">Chat Actions</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                disabled={isPending}
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={e => {
                  e.preventDefault()
                  // Don't call onDelete directly, just open the dialog
                }}
              >
                <Trash2 size={14} />
                Delete Chat
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this chat history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={onDelete} // Call onDelete here
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
