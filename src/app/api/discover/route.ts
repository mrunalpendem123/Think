import { searchSearxng } from '@/lib/searxng';
import { searchNewsAPI } from '@/lib/newsapi';
import { getSearxngURL, getSearxngFallbackURLs, getNewsAPIKey } from '@/lib/config/serverRegistry';

const websitesForTopic = {
  tech: {
    query: ['technology news', 'latest tech', 'AI', 'science and innovation'],
    links: ['techcrunch.com', 'wired.com', 'theverge.com'],
  },
  finance: {
    query: ['finance news', 'economy', 'stock market', 'investing'],
    links: ['bloomberg.com', 'cnbc.com', 'marketwatch.com'],
  },
  art: {
    query: ['art news', 'culture', 'modern art', 'cultural events'],
    links: ['artnews.com', 'hyperallergic.com', 'theartnewspaper.com'],
  },
  sports: {
    query: ['sports news', 'latest sports', 'cricket football tennis'],
    links: ['espn.com', 'bbc.com/sport', 'skysports.com'],
  },
  entertainment: {
    query: ['entertainment news', 'movies', 'TV shows', 'celebrities'],
    links: ['hollywoodreporter.com', 'variety.com', 'deadline.com'],
  },
};

type Topic = keyof typeof websitesForTopic;

export const GET = async (req: Request) => {
  try {
    const params = new URL(req.url).searchParams;

    const mode: 'normal' | 'preview' =
      (params.get('mode') as 'normal' | 'preview') || 'normal';
    const topic: Topic = (params.get('topic') as Topic) || 'tech';

    const selectedTopic = websitesForTopic[topic];
    const newsAPIKey = getNewsAPIKey();
    const searxngURL = getSearxngURL();
    const searxngFallbackURLs = getSearxngFallbackURLs();

    let data: any[] = [];
    let allInstancesRateLimited = false;

    // Prefer NewsAPI if configured (faster and more reliable)
    if (newsAPIKey) {
      try {
        console.log(`Using NewsAPI for topic: ${topic}`);
        
        // Map topics to NewsAPI categories
        const categoryMap: Record<string, string> = {
          tech: 'technology',
          finance: 'business',
          art: 'entertainment',
          sports: 'sports',
          entertainment: 'entertainment',
        };
        
        const articles = await searchNewsAPI('', categoryMap[topic] || 'general');
        
        // Map NewsAPI results to Discover format
        data = articles
          .filter((article) => article.urlToImage && article.title && article.url)
          .map((article) => ({
            title: article.title,
            content: article.description || article.content || '',
            url: article.url,
            thumbnail: article.urlToImage || '',
          }))
          .slice(0, 50);
        
        console.log(`NewsAPI returned ${data.length} articles`);
        
        // Return immediately if we have results
        if (data.length > 0) {
          return Response.json(
            {
              blogs: data,
            },
            {
              status: 200,
            },
          );
        }
      } catch (error: any) {
        console.warn('NewsAPI failed, falling back to SearXNG:', error.message);
        // Continue to SearXNG fallback
      }
    }

    // Fallback to SearXNG if NewsAPI not configured or failed
    const instancesToTry = [searxngURL, ...searxngFallbackURLs].filter(Boolean);

    if (instancesToTry.length === 0 && !newsAPIKey) {
      return Response.json(
        {
          message: 'No news source configured. Please configure NewsAPI key or SearXNG instance in settings.',
        },
        {
          status: 400,
        },
      );
    }

    for (const instanceURL of instancesToTry) {
      try {
        if (mode === 'normal') {
          const seenUrls = new Set();
          const allResults: any[] = [];

          // Optimized: Use fewer queries and process in parallel batches
          // Only use first link with first 2 queries for faster loading
          const queries = selectedTopic.links
            .slice(0, 1) // Only use first link for speed
            .flatMap((link) =>
              selectedTopic.query.slice(0, 2).map((query) => ({ link, query })), // Only first 2 queries
            );

          // Process queries in parallel batches (2 at a time) for faster loading
          const batchSize = 2;
          for (let i = 0; i < queries.length; i += batchSize) {
            const batch = queries.slice(i, i + batchSize);
            
            const batchResults = await Promise.allSettled(
              batch.map(async ({ link, query }) => {
                try {
                  const result = await searchSearxng(
                    `site:${link} ${query}`,
                    {
                      engines: ['bing news'],
                      pageno: 1,
                      language: 'en',
                    },
                    instanceURL,
                  );
                  return result.results || [];
                } catch (requestError: any) {
                  // If rate limited, throw to try next instance
                  if (requestError.message.includes('429') || requestError.message.includes('403')) {
                    console.warn(`Rate limited on ${instanceURL} for query ${link} ${query}`);
                    allInstancesRateLimited = true;
                    throw requestError;
                  }
                  // For other errors, return empty array
                  console.warn(`Query failed for ${link} ${query}:`, requestError.message);
                  return [];
                }
              }),
            );

            // Collect successful results
            for (const result of batchResults) {
              if (result.status === 'fulfilled') {
                allResults.push(...result.value);
              } else if (result.reason?.message?.includes('429') || result.reason?.message?.includes('403')) {
                // If rate limited in batch, break and try next instance
                throw result.reason;
              }
            }

            // Small delay between batches (not between individual queries)
            if (i + batchSize < queries.length) {
              await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms between batches
            }
          }

          // Map SearXNG results to Discover format
          data = allResults
            .filter((item) => {
              const url = item.url?.toLowerCase().trim();
              if (!url || seenUrls.has(url)) return false;
              seenUrls.add(url);
              return true;
            })
            .map((item) => ({
              title: item.title || '',
              content: item.content || '',
              url: item.url || '',
              thumbnail:
                item.thumbnail ||
                item.thumbnail_src ||
                item.img_src ||
                '',
            }))
            .filter((item) => item.thumbnail && item.title && item.url) // Only include items with thumbnail
            .sort(() => Math.random() - 0.5)
            .slice(0, 50); // Limit to 50 results
        } else {
          const result = await searchSearxng(
            `site:${selectedTopic.links[Math.floor(Math.random() * selectedTopic.links.length)]} ${selectedTopic.query[Math.floor(Math.random() * selectedTopic.query.length)]}`,
            {
              engines: ['bing news'],
              pageno: 1,
              language: 'en',
            },
            instanceURL,
          );

          // Map SearXNG results to Discover format
          data = (result.results || [])
            .map((item: any) => ({
              title: item.title || '',
              content: item.content || '',
              url: item.url || '',
              thumbnail:
                item.thumbnail ||
                item.thumbnail_src ||
                item.img_src ||
                '',
            }))
            .filter((item) => item.thumbnail && item.title && item.url);
        }

        // Success! Break out of the loop
        if (data.length > 0) {
          break;
        }
      } catch (error: any) {
        console.warn(`SearXNG instance ${instanceURL} failed:`, error.message);
        
        // If rate limited, mark it and wait before trying next instance
        if (error.message.includes('429') || error.message.includes('403')) {
          allInstancesRateLimited = true;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced to 1 second for faster failover
        }
        
        // Continue to next instance
        continue;
      }
    }

    // If all instances were rate limited, return empty results with 200 status
    // This allows the frontend to handle it gracefully
    if (data.length === 0 && allInstancesRateLimited) {
      console.warn('All SearXNG instances are rate limited. Returning empty results.');
      return Response.json(
        {
          blogs: [],
          message: 'SearXNG instances are currently rate limited. Please try again in a few minutes.',
        },
        {
          status: 200, // Return 200 with empty results instead of error
        },
      );
    }

    return Response.json(
      {
        blogs: data,
      },
      {
        status: 200,
      },
    );
  } catch (err: any) {
    console.error(`An error occurred in discover route: ${err}`);
    
    // For rate limiting errors, return empty results instead of 500
    if (err.message && (err.message.includes('429') || err.message.includes('403'))) {
      return Response.json(
        {
          blogs: [],
          message: 'SearXNG instances are currently rate limited. Please try again in a few minutes.',
        },
        {
          status: 200,
        },
      );
    }
    
    return Response.json(
      {
        blogs: [],
        message: err.message || 'An error has occurred while fetching discover content. Please ensure SearXNG URL is configured.',
      },
      {
        status: 200, // Return 200 with empty results to prevent frontend errors
      },
    );
  }
};
