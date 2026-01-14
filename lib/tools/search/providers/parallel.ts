import { SearchResults } from '@/lib/types'
import { sanitizeUrl } from '@/lib/utils'

import { BaseSearchProvider } from './base'

export class ParallelSearchProvider extends BaseSearchProvider {
  async search(
    query: string,
    maxResults: number = 10,
    searchDepth: 'basic' | 'advanced' = 'basic',
    includeDomains: string[] = [],
    excludeDomains: string[] = []
  ): Promise<SearchResults> {
    const apiKey = process.env.PARALLEL_API_KEY
    this.validateApiKey(apiKey, 'PARALLEL')

    console.log(`Parallel AI search query: "${query}"`)
    
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'parallel-beta': 'search-extract-2025-10-10'
      },
      body: JSON.stringify({
        objective: query,
        max_results: maxResults
      })
    })
    
    console.log(`Parallel AI response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(
        `Parallel AI API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log(`Parallel AI returned ${data.results?.length || 0} results`)

    // Transform Parallel AI response to match SearchResults interface
    const results = (data.results || []).map((result: any) => ({
      title: result.title || '',
      url: sanitizeUrl(result.url || ''),
      content: (result.excerpts || []).join('\n') || ''
    }))

    // Parallel AI doesn't return images in the same way, so return empty array
    const images: any[] = []

    return {
      query: query,
      results,
      images,
      number_of_results: results.length
    }
  }
}

