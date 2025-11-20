import type { LibraryBook } from '../types';
import { robustFetchJson, robustFetchText } from './utils';

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBookResult[];
}

export interface GutendexBookResult {
  id: number;
  title: string;
  authors: { name: string; birth_year: number; death_year: number }[];
  formats: { [key: string]: string };
}

/**
 * Ensures a given URL uses the HTTPS protocol.
 */
function ensureHttps(url: string | null | undefined): string | null | undefined {
    if (typeof url === 'string' && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
}

const findTextUrls = (formats: { [key: string]: string }): string[] => {
  const potentialUrls: { url: string; priority: number }[] = [];

  for (const key in formats) {
      if (key.startsWith('text/plain')) {
          const url = formats[key];
          // Exclude zip files
          if (url.endsWith('.zip')) continue;
          
          let priority = 0;
          if (url.endsWith('.txt')) priority += 10;
          if (key.includes('utf-8')) priority += 5;
          if (key.includes('us-ascii')) priority += 2;
          
          potentialUrls.push({ url, priority });
      }
  }

  const sortedUrls = potentialUrls
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.url);

  return [...new Set(sortedUrls)];
};

export async function fetchPublicBooks(
  language: 'en' | 'de',
  pageUrl?: string,
  searchQuery?: string,
): Promise<{ books: LibraryBook[]; nextPageUrl: string | null }> {
  const baseUrl = 'https://gutendex.com/books/';
  let finalUrl: string;

  if (pageUrl) {
    finalUrl = pageUrl;
  } else {
    const params = new URLSearchParams({ languages: language, sort: 'popular' });
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    finalUrl = `${baseUrl}?${params.toString()}`;
  }

  try {
    const data = await robustFetchJson<GutendexResponse>(finalUrl, {}, 30000);
    
    const books: LibraryBook[] = data.results
      .map((book): LibraryBook | null => {
        return {
          id: String(book.id),
          source: 'gutenberg',
          title: book.title,
          author: book.authors[0]?.name || 'Unknown Author',
          coverImageUrl: ensureHttps(book.formats['image/jpeg']),
          textUrl: findTextUrls(book.formats)[0], 
          sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
        };
      })
      .filter((book): book is LibraryBook => book !== null);

    return { books, nextPageUrl: ensureHttps(data.next) };
  } catch (error: unknown) {
    console.error('Failed to fetch from Gutendex:', error);
    throw new Error(`Failed to fetch books from the library. Please check your connection.`);
  }
}

// --- ROBUST TEXT FETCHING LOGIC (AUDITED & FIXED) ---

/**
 * Strategy 1: CORS Proxy IO (Raw Text)
 * Generally the fastest and handles standard text responses well.
 */
const fetchViaCorsProxy = async (url: string): Promise<string> => {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    return robustFetchText(proxyUrl, {}, 15000);
};

/**
 * Strategy 2: AllOrigins (JSON Wrapped)
 * A robust backup that returns { contents: "..." }. Useful if Strategy 1 is blocked or failing.
 */
const fetchViaAllOrigins = async (url: string): Promise<string> => {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await robustFetchJson<{ contents: string; status: { http_code: number } }>(proxyUrl, {}, 15000);
    if (response.contents) return response.contents;
    throw new Error('AllOrigins returned empty content');
};

// Strategy array for failover
const FETCH_STRATEGIES = [
    fetchViaCorsProxy,
    fetchViaAllOrigins
];

async function fetchWithFailover(targetUrl: string): Promise<string> {
    let lastError: unknown;
    
    for (const fetchStrategy of FETCH_STRATEGIES) {
        try {
            // Ensure we aren't trying to fetch undefined URLs
            if (!targetUrl) throw new Error("Target URL is undefined");

            const text = await fetchStrategy(targetUrl);
            if (text && text.length > 500) {
                return text;
            }
            throw new Error("Fetched text was too short or empty.");
        } catch (e) {
            lastError = e;
            console.warn(`Proxy strategy failed for ${targetUrl}:`, e);
            // Continue to next strategy
        }
    }
    throw lastError || new Error(`Failed to fetch ${targetUrl} via any proxy.`);
}

function cleanGutenbergText(text: string): string {
  // 1. Identify Main Content Boundaries
  // Gutenberg books have aggressive legal headers. We need to find the *actual* start and end.
  
  const startMarkers = [
    /\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
    /^\s*START OF THE PROJECT GUTENBERG EBOOK/im,
    /^\s*Project Gutenberg's.*by/im,
  ];
  
  const endMarkers = [
     /\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
     /^\s*End of the Project Gutenberg EBook/im,
     /^\s*End of Project Gutenberg's/im,
  ];
  
  let startIndex = 0;
  for (const marker of startMarkers) {
      const match = text.match(marker);
      if (match && match.index !== undefined) {
          // Skip past the marker line
          const endOfLine = text.indexOf('\n', match.index + match[0].length);
          startIndex = endOfLine !== -1 ? endOfLine + 1 : match.index + match[0].length;
          break;
      }
  }

  let endIndex = text.length;
   for (const marker of endMarkers) {
      const match = text.match(marker);
      if (match && match.index !== undefined) {
          endIndex = match.index;
          break;
      }
   }

  // If markers failed (rare but possible), try to heuristic chop the first 5% and last 15% 
  // which usually contain the heavy legalese if strict markers aren't found.
  if (startIndex === 0 && endIndex === text.length) {
      // Fallback: Look for "produced by" early on
      const producedBy = text.slice(0, 2000).match(/Produced by/i);
      if (producedBy && producedBy.index) startIndex = producedBy.index + 50;
  }

  let cleanedText = text.substring(startIndex, endIndex);

  // 2. Remove intra-text license pollution
  // Some texts have "THIS ELECTRONIC VERSION..." embedded.
  cleanedText = cleanedText.replace(/<<\s*THIS ELECTRONIC VERSION.*?\>\>/gis, '');

  // 3. Normalize Typography & Formatting for AI
  cleanedText = cleanedText
      .replace(/\r\n/g, '\n') // Standardize line endings
      .replace(/\[Illustration.*?\]/gi, '') // Remove illustration markers
      .replace(/\[Note:.*?\]/gi, '') // Remove transcriber notes
      .replace(/_([^_]+)_/g, '$1') // Remove underscores (italics)
      .replace(/[ \t]{2,}/g, ' ') // Collapse multiple spaces
      .replace(/\n{3,}/g, '\n\n') // Max 2 blank lines
      .trim();
      
  return cleanedText;
}

/**
 * Robustly fetches a Gutenberg book.
 * Instead of relying on the potentially stale URL from the API,
 * it attempts to construct the canonical URL paths used by Gutenberg's servers.
 */
export async function fetchBookTextWithFallbacks(bookId: string): Promise<string> {
    const id = String(bookId);
    
    // Construct candidate URLs in order of reliability
    const candidates = [
        // Modern Cache: Most reliable for newer/updated books
        `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
        // Standard File Path (often redirects, but proxies might handle it)
        `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
        // Older standard
        `https://www.gutenberg.org/files/${id}/${id}.txt`,
        // Robot path (sometimes works for very old IDs)
        `https://www.gutenberg.org/robot/harvest?filetypes[]=txt&ids[]=${id}`
    ];

    // Try to fetch from candidates
    let lastError: unknown;
    for (const url of candidates) {
        try {
            console.log(`[Gutenberg] Attempting fetch: ${url}`);
            const rawText = await fetchWithFailover(url);
            
            // Validation: If we got a 404 page HTML instead of text, throw
            if (rawText.includes('<!DOCTYPE html') || rawText.includes('<html')) {
                throw new Error('Received HTML instead of plain text');
            }

            const cleaned = cleanGutenbergText(rawText);
            
            // Validation: Ensure we actually have content after cleanup
            if (cleaned.length < 500) {
                throw new Error('Content too short after cleanup');
            }

            return cleaned;
        } catch (error) {
            lastError = error;
            console.warn(`[Gutenberg] Candidate failed: ${url}`, error);
            // Continue to next candidate
        }
    }
    
    throw new Error(`Could not retrieve text for Book ID ${id}. All sources failed. Last error: ${lastError}`);
}

// Deprecated but kept for compatibility with generic calls
export async function fetchBookText(url: string): Promise<string> {
    // Extract ID if possible to use the robust method
    const idMatch = url.match(/gutenberg\.org\/.*\/(\d+)/);
    if (idMatch) {
        return fetchBookTextWithFallbacks(idMatch[1]);
    }
    // Fallback to direct fetch
    const text = await fetchWithFailover(url);
    return cleanGutenbergText(text);
}