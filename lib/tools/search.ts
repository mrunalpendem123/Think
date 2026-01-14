import { tool } from 'ai'

import { getSearchSchemaForModel } from '@/lib/schema/search'
import { SearchResults } from '@/lib/types'
import { getBaseUrlString } from '@/lib/utils/url'

import {
  createSearchProvider,
  DEFAULT_PROVIDER,
  SearchProviderType
} from './search/providers'

/**
 * Creates a search tool with the appropriate schema for the given model.
 */
export function createSearchTool(fullModel: string) {
  return tool({
    description: 'Search the web for information. You MUST provide a query string to search for. Example: {"query": "latest AI developments", "max_results": 20}',
    parameters: getSearchSchemaForModel(fullModel),
    execute: async ({
      query,
      max_results = 20,
      search_depth = 'basic', // Default for standard schema
      include_domains = [],
      exclude_domains = []
    }) => {
      // Validate that query exists
      if (!query || query.trim() === '') {
        throw new Error('Search query is required and cannot be empty')
      }
      // Ensure max_results is at least 10
      const minResults = 10
      const effectiveMaxResults = Math.max(
        max_results || minResults,
        minResults
      )
      const effectiveSearchDepth = search_depth as 'basic' | 'advanced'

      // Use the original query as is
      const filledQuery = query
      let searchResult: SearchResults

      console.log(`Using Parallel AI search for query: "${filledQuery}"`)

      try {
        // Always use Parallel AI provider
        const searchProvider = createSearchProvider()
        searchResult = await searchProvider.search(
          filledQuery,
          effectiveMaxResults,
          effectiveSearchDepth,
          include_domains,
          exclude_domains
        )
      } catch (error) {
        console.error('Search API error:', error)
        searchResult = {
          results: [],
          query: filledQuery,
          images: [],
          number_of_results: 0
        }
      }

      console.log('completed search')
      return searchResult
    }
  })
}

// Default export for backward compatibility, using a default model
export const searchTool = createSearchTool('openai:gpt-4o-mini')

export async function search(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  return searchTool.execute(
    {
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    },
    {
      toolCallId: 'search',
      messages: []
    }
  )
}
