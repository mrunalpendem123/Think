'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { toast } from 'sonner'
import { useAccount } from 'wagmi'

import { getChatsPage } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/utils/session'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar'

import { ChatHistorySkeleton } from './chat-history-skeleton'
import { ChatMenuItem } from './chat-menu-item'
import { ClearHistoryAction } from './clear-history-action'

export function ChatHistoryClient() {
  const { address, isConnected } = useAccount()
  const [chats, setChats] = useState<Chat[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  // Get current user ID (wallet address or session ID)
  const getUserId = useCallback(() => {
    if (isConnected && address) {
      return address
    }
    return getOrCreateSessionId()
  }, [isConnected, address])

  const fetchInitialChats = useCallback(async () => {
    setIsLoading(true)
    try {
      const userId = getUserId()
      const { chats: newChats, nextOffset: newNextOffset } = await getChatsPage(userId, 20, 0)

      setChats(newChats)
      setNextOffset(newNextOffset)
    } catch (error) {
      console.error('Failed to load initial chats:', error)
      toast.error('Failed to load chat history.')
      setNextOffset(null)
    } finally {
      setIsLoading(false)
    }
  }, [getUserId])

  useEffect(() => {
    fetchInitialChats()
  }, [fetchInitialChats])

  useEffect(() => {
    const handleHistoryUpdate = () => {
      startTransition(() => {
        fetchInitialChats()
      })
    }
    window.addEventListener('chat-history-updated', handleHistoryUpdate)
    return () => {
      window.removeEventListener('chat-history-updated', handleHistoryUpdate)
    }
  }, [fetchInitialChats])

  const fetchMoreChats = useCallback(async () => {
    if (isLoading || nextOffset === null) return

    setIsLoading(true)
    try {
      const userId = getUserId()
      const { chats: newChats, nextOffset: newNextOffset } = await getChatsPage(userId, 20, nextOffset)

      setChats(prevChats => [...prevChats, ...newChats])
      setNextOffset(newNextOffset)
    } catch (error) {
      console.error('Failed to load more chats:', error)
      toast.error('Failed to load more chat history.')
      setNextOffset(null)
    } finally {
      setIsLoading(false)
    }
  }, [nextOffset, isLoading, getUserId])

  useEffect(() => {
    const observerRefValue = loadMoreRef.current
    if (!observerRefValue || nextOffset === null || isPending) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && !isPending) {
          fetchMoreChats()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerRefValue)

    return () => {
      if (observerRefValue) {
        observer.unobserve(observerRefValue)
      }
    }
  }, [fetchMoreChats, nextOffset, isLoading, isPending])

  const isHistoryEmpty = !isLoading && !chats.length && nextOffset === null

  return (
    <div className="flex flex-col flex-1 h-full">
      <SidebarGroup>
        <div className="flex items-center justify-between w-full">
          <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
          <ClearHistoryAction empty={isHistoryEmpty} />
        </div>
      </SidebarGroup>
      <div className="flex-1 overflow-y-auto mb-2 relative">
        {isHistoryEmpty && !isPending ? (
          <div className="px-2 text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          <SidebarMenu>
            {chats.map(
              (chat: Chat) => chat && <ChatMenuItem key={chat.id} chat={chat} />
            )}
          </SidebarMenu>
        )}
        <div ref={loadMoreRef} style={{ height: '1px' }} />
        {(isLoading || isPending) && (
          <div className="py-2">
            <ChatHistorySkeleton />
          </div>
        )}
      </div>
    </div>
  )
}
