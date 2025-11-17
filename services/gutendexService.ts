export interface LibraryBook {
  id: number;
  title: string;
  author: string;
  coverImageUrl?: string;
  textUrl?: string;
}

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

// Helper to find the plain text URL
const findTextUrl = (formats: { [key: string]: string }): string | undefined => {
  // Prioritize utf-8 text file
  if (formats['text/plain; charset=utf-8'])
    return formats['text/plain; charset=utf-8'];
  // Fallback to any plain text
  const plainTextKey = Object.keys(formats).find((key) =>
    key.startsWith('text/plain'),
  );
  return formats[plainTextKey || ''];
};

export async function fetchPublicBooks(
  language: 'en' | 'de',
  pageUrl?: string,
): Promise<{ books: LibraryBook[]; nextPageUrl: string | null }> {
  const url =
    pageUrl ||
    `https://gutendex.com/books/?languages=${language}&sort=popular`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch books from Gutendex API');
  }

  const data: GutendexResponse = await response.json();

  const books: LibraryBook[] = data.results
    .map((book): LibraryBook | null => {
      const textUrl = findTextUrl(book.formats);
      if (!textUrl) return null; // Skip books that don't have a plain text version

      return {
        id: book.id,
        title: book.title,
        author: book.authors[0]?.name || 'Unknown Author',
        coverImageUrl: book.formats['image/jpeg'],
        textUrl,
      };
    })
    .filter((book): book is LibraryBook => book !== null); // Filter out nulls

  return { books, nextPageUrl: data.next };
}

export async function fetchBookText(url: string): Promise<string> {
  // STRATEGIC FIX: Cycle to a different public CORS proxy to address recurring fetch failures.
  // Project Gutenberg servers lack the necessary `Access-Control-Allow-Origin` header,
  // blocking direct client-side requests. The public proxies used to circumvent this are
  // inherently unstable. This change attempts to restore functionality by using an alternative service.
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${url}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch book text from ${url} via proxy`);
  }
  const text = await response.text();

  // Basic cleanup to remove Gutenberg header/footer
  const startMarker =
    /^\s*\*\*\* START OF (THIS|THE) PROJECT GUTENBERG EBOOK.*\*\*\*\s*$/m;
  const endMarker =
    /^\s*\*\*\* END OF (THIS|THE) PROJECT GUTENBERG EBOOK.*\*\*\*\s*$/m;

  let startIndex = text.search(startMarker);
  if (startIndex !== -1) {
    // Find the end of the line where the marker was found
    startIndex = text.indexOf('\n', startIndex) + 1;
  } else {
    startIndex = 0; // If no start marker, start from the beginning
  }

  let endIndex = text.search(endMarker);
  if (endIndex === -1) {
    endIndex = text.length; // If no end marker, go to the end
  }

  return text.substring(startIndex, endIndex).trim();
}