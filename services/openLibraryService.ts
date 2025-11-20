import type { LibraryBook } from '../types';
import { robustFetchJson, robustFetchText } from './utils';

// --- Type definitions for API responses ---

interface OpenLibrarySearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  has_fulltext: boolean;
  ia?: string[];
}

interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibrarySearchDoc[];
}

// Interfaces for Internet Archive metadata
interface IaFile {
  name: string;
  source: string;
  format: string;
}

interface IaMetadata {
  files: IaFile[];
  server: string;
  dir: string;
}

const langCodeMap = {
  en: 'eng',
  de: 'ger',
};

export async function fetchPublicBooks(
  language: 'en' | 'de',
  page: number,
  searchQuery?: string,
): Promise<{ books: LibraryBook[]; hasMore: boolean; pageFetched: number }> {
  const baseUrl = 'https://openlibrary.org/search.json';
  const defaultQuery =
    language === 'de' ? 'subject:"Roman"' : 'subject:"classic fiction"';

  // Combine the main query with a strict language filter for accurate results.
  const q = `${searchQuery?.trim() || defaultQuery} language:${
    langCodeMap[language]
  }`;

  const params = new URLSearchParams({
    q,
    has_fulltext: 'true',
    public_scan_b: 'true', // IMPROVEMENT: Filter for publicly available scans to increase download success rate
    fields: 'key,title,author_name,cover_i,ia,has_fulltext',
    page: String(page),
    limit: '15', // Reduced limit to improve response speed and reduce timeouts
    lang: language, // Use 2-letter code to influence results (e.g., prefer French edition)
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    // Increased timeout to 45000ms (45s) as OpenLibrary search can be slow
    const data = await robustFetchJson<OpenLibrarySearchResponse>(url, {}, 45000);

    const books: LibraryBook[] = data.docs
      .map((doc): LibraryBook | null => {
        // Ensure we have a valid IA id, not an ISBN or other unusable identifier.
        const validIaId = doc.ia?.find((id) => !id.startsWith('isbn'));
        if (!validIaId) return null;

        return {
          id: doc.key,
          source: 'openlibrary',
          title: doc.title,
          author: doc.author_name?.[0] || 'Unknown Author',
          coverImageUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : undefined,
          iaId: validIaId,
          sourceUrl: `https://openlibrary.org${doc.key}`,
        };
      })
      .filter((book): book is LibraryBook => book !== null);

    const hasMore = data.start + data.docs.length < data.numFound;
    return { books, hasMore, pageFetched: page };
  } catch (error: unknown) {
    console.warn('OpenLibrary fetch warning:', error);
    // Return empty result set on failure instead of throwing to allow other sources to populate
    return { books: [], hasMore: false, pageFetched: page };
  }
}

/**
 * Robustly fetches book text from the Internet Archive by first querying
 * the item's metadata to find the correct text file, then downloading it.
 * This avoids failures from incorrect hardcoded URL patterns.
 * @param iaId The Internet Archive identifier for the book.
 * @returns A promise that resolves with the full text of the book.
 */
export async function fetchBookText(iaId: string): Promise<string> {
  const metadataUrl = `https://archive.org/metadata/${iaId}`;

  try {
    // 45s timeout for metadata
    const metadata = await robustFetchJson<IaMetadata>(metadataUrl, {}, 45000);

    if (!metadata.files) {
      throw new Error('No files found in Internet Archive metadata.');
    }

    // Find potential text files, prioritizing DjVuTXT then Plain text.
    const djvuFile = metadata.files.find((f) => f.format === 'DjVuTXT');
    const txtFile = metadata.files.find((f) => f.format === 'Plain text');

    const targetFile = djvuFile || txtFile;

    if (!targetFile) {
      throw new Error(
        'No suitable text file (DjVuTXT or Plain Text) found for this item.',
      );
    }

    // Filename might have './' prefix, which needs to be removed.
    const filename = targetFile.name.startsWith('./')
      ? targetFile.name.substring(2)
      : targetFile.name;

    // Construct the direct download URL.
    const textUrl = `https://archive.org/download/${iaId}/${filename}`;

    // 60s timeout for full text download
    const text = await robustFetchText(textUrl, {}, 60000);
    return text.trim();
  } catch (error: unknown) {
    console.error(
      `Failed to fetch or process book text for IA ID ${iaId}:`,
      error,
    );
    if (error instanceof Error) {
      // Provide a more user-friendly error message.
      throw new Error(
        `Failed to download book from Internet Archive. The file may be missing or the server is unavailable. (Details: ${error.message})`,
      );
    }
    throw new Error(
      `An unknown error occurred while downloading book from Internet Archive.`,
    );
  }
}