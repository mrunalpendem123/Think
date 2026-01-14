import { getParallelAPIKey } from './config/serverRegistry';

interface ParallelSearchResult {
  title: string;
  url: string;
  content?: string;
  excerpts?: string[];
}

interface ParallelSearchResponse {
  results: ParallelSearchResult[];
  suggestions?: string[];
}

export const searchParallel = async (
  query: string,
  maxResults: number = 10,
): Promise<{ results: ParallelSearchResult[]; suggestions: string[] }> => {
  const apiKey = getParallelAPIKey();

  if (!apiKey) {
    throw new Error('Parallel AI API key is not configured');
  }

  const response = await fetch('https://api.parallel.ai/v1beta/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'parallel-beta': 'search-extract-2025-10-10',
    },
    body: JSON.stringify({
      objective: query,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Parallel AI API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: ParallelSearchResponse = await response.json();

  // Transform Parallel AI results to match SearxNG format
  const results: ParallelSearchResult[] = (data.results || []).map((result) => ({
    title: result.title || '',
    url: result.url || '',
    content: result.content || (result.excerpts || []).join('\n'),
    excerpts: result.excerpts || [],
  }));

  return {
    results,
    suggestions: data.suggestions || [],
  };
};

