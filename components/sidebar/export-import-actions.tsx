'use client'

import { useRef, useState } from 'react'

import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

import { exportChats, importChats } from '@/lib/storage/export-import'
import { getOrCreateSessionId } from '@/lib/utils/session'

import { Button } from '@/components/ui/button'
import {
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'

export function ExportImportActions() {
  const { address, isConnected } = useAccount()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUserId = () => {
    if (isConnected && address) {
      return address
    }
    return getOrCreateSessionId()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const userId = getUserId()
      await exportChats(userId)
      toast.success('Chat history exported successfully')
    } catch (error) {
      console.error('Failed to export chats:', error)
      toast.error('Failed to export chat history')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const userId = getUserId()
      const count = await importChats(file, userId)
      toast.success(`Successfully imported ${count} chat(s)`)
    } catch (error) {
      console.error('Failed to import chats:', error)
      toast.error('Failed to import chat history')
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <DropdownMenuItem
        disabled={isExporting}
        onClick={handleExport}
        className="gap-2"
      >
        {isExporting ? <Spinner /> : <Download size={14} />}
        Export History
      </DropdownMenuItem>
      
      <DropdownMenuItem
        disabled={isImporting}
        onClick={triggerFileInput}
        className="gap-2"
      >
        {isImporting ? <Spinner /> : <Upload size={14} />}
        Import History
      </DropdownMenuItem>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </>
  )
}

