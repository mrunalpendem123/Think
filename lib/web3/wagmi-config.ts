import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrum, base,mainnet, optimism, polygon } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Private Search AI',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c1c3518641e82c96d2b1d3f8e8e07b51', // Public fallback
  chains: [
    polygon,     // Primary - free to connect, fast
    mainnet,     // Ethereum mainnet
    optimism,    // Optimism L2
    arbitrum,    // Arbitrum L2
    base         // Base L2
  ],
  ssr: true // Enable server-side rendering
})

