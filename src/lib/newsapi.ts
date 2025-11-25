import { getNewsAPIKey } from './config/serverRegistry';

interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export const searchNewsAPI = async (
  query: string,
  category?: string,
  sources?: string[],
): Promise<NewsAPIArticle[]> => {
  const apiKey = getNewsAPIKey();

  if (!apiKey) {
    throw new Error('NewsAPI key is not configured. Please set NEWSAPI_KEY environment variable or configure it in settings.');
  }

  const url = new URL('https://newsapi.org/v2/top-headlines');
  
  // Add query if provided
  if (query) {
    url.searchParams.append('q', query);
  }
  
  // Add category if provided
  if (category) {
    url.searchParams.append('category', category);
  }
  
  // Add sources if provided
  if (sources && sources.length > 0) {
    url.searchParams.append('sources', sources.join(','));
  } else {
    // If no sources, use language filter
    url.searchParams.append('language', 'en');
  }
  
  url.searchParams.append('pageSize', '50');
  url.searchParams.append('apiKey', apiKey);

  const res = await fetch(url.toString());
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`NewsAPI error: ${res.status} ${errorData.message || res.statusText}`);
  }
  
  const data: NewsAPIResponse = await res.json();
  
  if (data.status !== 'ok') {
    throw new Error(`NewsAPI returned status: ${data.status}`);
  }

  return data.articles || [];
};

