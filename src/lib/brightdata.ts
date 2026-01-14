import { getBrightDataAPIKey } from './config/serverRegistry';
import { load } from 'cheerio';

interface BrightDataSERPResult {
  title: string;
  url: string;
  description?: string;
  snippet?: string;
}

interface BrightDataSearchParams {
  query: string;
  country?: string;
  limit?: number;
}

export const searchBrightData = async (
  query: string,
  limit: number = 10,
): Promise<{ results: Array<{ title: string; url: string; content: string }> }> => {
  const apiKey = getBrightDataAPIKey();

  if (!apiKey) {
    throw new Error('BrightData API key is not configured. Please set BRIGHTDATA_API_KEY environment variable or configure it in settings.');
  }

  try {
    // Use BrightData SERP API to scrape Google search results
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: 'serp_api1',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${limit}`,
        format: 'json',
        method: 'GET',
        country: 'us',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BrightData API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // BrightData wraps response in { status_code, headers, body }
    if (data.status_code !== 200) {
      const errorMsg = data.headers?.['x-brd-err-msg'] || `BrightData returned status ${data.status_code}`;
      throw new Error(errorMsg);
    }
    
    // Parse BrightData response and format results
    const results = parseSearchResults(data.body);
    
    return { results };
  } catch (error: any) {
    console.error('BrightData search error:', error);
    throw new Error(`BrightData search failed: ${error.message}`);
  }
};

function parseSearchResults(body: any): Array<{ title: string; url: string; content: string }> {
  const results: Array<{ title: string; url: string; content: string }> = [];

  try {
    // BrightData body might be a string (HTML) or object (JSON)
    let parsedBody = body;
    
    if (typeof body === 'string') {
      // If it's HTML, parse it to extract search results
      parsedBody = parseHTMLSearchResults(body);
    }
    
    // Parse organic results from structured data
    if (parsedBody.organic_results && Array.isArray(parsedBody.organic_results)) {
      parsedBody.organic_results.forEach((result: any) => {
        if (result.url && result.title) {
          results.push({
            title: result.title || '',
            url: result.url || '',
            content: result.snippet || result.description || '',
          });
        }
      });
    }
    
    // Fallback: if data is in different format
    if (results.length === 0 && Array.isArray(parsedBody)) {
      parsedBody.forEach((result: any) => {
        if (result.link || result.url) {
          results.push({
            title: result.title || result.heading || '',
            url: result.link || result.url || '',
            content: result.snippet || result.description || result.text || '',
          });
        }
      });
    }

    // Another fallback: check for results array
    if (results.length === 0 && parsedBody.results && Array.isArray(parsedBody.results)) {
      parsedBody.results.forEach((result: any) => {
        if (result.link || result.url) {
          results.push({
            title: result.title || '',
            url: result.link || result.url || '',
            content: result.snippet || result.description || '',
          });
        }
      });
    }

  } catch (error) {
    console.error('Error parsing BrightData results:', error);
  }

  return results;
}

function parseHTMLSearchResults(html: string): any {
  const results: any[] = [];
  
  try {
    const $ = load(html);
    
    // Find all main search result divs - use the selectors that worked in testing
    $('div.g, div[jscontroller][lang]').each((i, elem) => {
      try {
        const $elem = $(elem);
        const $link = $elem.find('a').first();
        let url = $link.attr('href') || '';
        
        // If URL is encoded in /url?q= format, extract it
        if (url.includes('/url?q=')) {
          const urlMatch = url.match(/\/url\?q=([^&]+)/);
          if (urlMatch) {
            url = decodeURIComponent(urlMatch[1]);
          }
        }
        
        // Find the title (usually in h3)
        const title = $elem.find('h3').text().trim();
        
        // Find the snippet
        const snippet = $elem.find('div.VwiC3b, div[data-sncf="1"]').text().trim();
        
        // Skip Google's own links and invalid results
        if (
          url &&
          title &&
          url.startsWith('http') &&
          !url.includes('google.com') &&
          !url.includes('youtube.com/watch')
        ) {
          results.push({
            url,
            title,
            snippet: snippet || title,
          });
        }
      } catch (err) {
        // Skip invalid results
      }
    });
    
  } catch (error) {
    console.error('Error parsing HTML with cheerio:', error);
  }
  
  return { organic_results: results };
}

