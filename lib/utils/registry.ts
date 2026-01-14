import { createOpenAI } from '@ai-sdk/openai'
import {
  createProviderRegistry,
  extractReasoningMiddleware,
  wrapLanguageModel
} from 'ai'

// Venice AI - OpenAI-compatible provider
const venice = createOpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: 'https://api.venice.ai/api/v1'
})

export const registry = createProviderRegistry({
  venice
})

export function getModel(model: string) {
  const [provider, ...modelNameParts] = model.split(':') ?? []
  const modelName = modelNameParts.join(':')
  
  // All models go through Venice AI
  return venice(modelName)
}

export function isProviderEnabled(providerId: string): boolean {
  // Only Venice AI is enabled
  return providerId === 'venice' && !!process.env.VENICE_API_KEY
}

export function getToolCallModel(model?: string) {
  // Use llama-3.3-70b for tool calls (Venice AI's balanced model)
  return getModel('venice:llama-3.3-70b')
}

export function isToolCallSupported(model?: string) {
  // Venice AI models support tool calls
  return true
}

export function isReasoningModel(model: string): boolean {
  // Venice AI doesn't have reasoning models in the same way
  return false
}
