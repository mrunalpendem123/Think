import { getSearxngURL, getSearxngFallbackURL } from './config/serverRegistry';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
  time_range?: 'day' | 'month' | 'year';
  format?: 'json' | 'csv' | 'rss';
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
  instanceURL?: string,
) => {
  const searxngURL = instanceURL || getSearxngURL();

  if (!searxngURL) {
    throw new Error('SearXNG URL is not configured. Please set SEARXNG_API_URL environment variable or configure it in settings.');
  }

  // Use /search endpoint with JSON format (as per SearXNG API docs)
  const url = new URL(`${searxngURL}/search`);
  
  // Set format (default to json if not specified)
  const format = opts?.format || 'json';
  url.searchParams.append('format', format);
  
  // Required parameter: query
  url.searchParams.append('q', query);

  // Optional parameters (as per SearXNG API documentation)
  if (opts) {
    if (opts.categories && Array.isArray(opts.categories)) {
      url.searchParams.append('categories', opts.categories.join(','));
    }
    
    if (opts.engines && Array.isArray(opts.engines)) {
      url.searchParams.append('engines', opts.engines.join(','));
    }
    
    if (opts.language) {
      url.searchParams.append('language', opts.language);
    }
    
    if (opts.pageno) {
      url.searchParams.append('pageno', opts.pageno.toString());
    }
    
    if (opts.time_range) {
      url.searchParams.append('time_range', opts.time_range);
    }
  }

  const res = await fetch(url.toString());
  
  if (!res.ok) {
    throw new Error(`SearXNG API error: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();

  const results: SearxngSearchResult[] = data.results || [];
  const suggestions: string[] = data.suggestions || [];

  return { results, suggestions };
};
