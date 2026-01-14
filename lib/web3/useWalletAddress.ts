'use client'

import { useAccount } from 'wagmi'

export function useWalletAddress() {
  const { address, isConnected } = useAccount()
  
  return {
    address: address || null,
    isConnected,
    // Use wallet address as userId for chat history
    userId: address || 'anonymous'
  }
}

