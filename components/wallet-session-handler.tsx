'use client'

import { useEffect } from 'react'

import { useAccount } from 'wagmi'

import { setCookie } from '@/lib/utils/cookies'
import { clearSessionId } from '@/lib/utils/session'

export function WalletSessionHandler() {
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      // Save wallet address to cookies for server-side access
      setCookie('wallet-address', address)
      clearSessionId() // Clear anonymous session when wallet connects
      console.log('Wallet connected:', address)
    } else {
      // Clear wallet address when disconnected
      setCookie('wallet-address', '')
      console.log('Wallet disconnected')
    }
    
    // Trigger chat history update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('chat-history-updated'))
    }
  }, [address, isConnected])

  return null // This component doesn't render anything
}

