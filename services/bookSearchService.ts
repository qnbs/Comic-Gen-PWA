
import type { LibraryBook, LibrarySource } from '../types';
import * as gutendexService from './gutendexService';
import * as openLibraryService from './openLibraryService';

// --- Adapter Functions ---
// These pure functions transform API-specific responses into the Unified Domain Model (LibraryBook).

const adaptGutendex = (data: { books: LibraryBook[] }): LibraryBook[] => data.books;

const adaptOpenLibrary = (data: { books: LibraryBook[] }): LibraryBook[] => data.books;

// --- Unified Search Service ---

/**
 * Interleaves multiple arrays of books.
 * @param arrays An array of book arrays from different sources.
 * @returns A single, interleaved array of books.
 */
function interleaveBooks(...arrays: LibraryBook[][]): LibraryBook[] {
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    const result: LibraryBook[] = [];
    const idSet = new Set<string>();

    for (let i = 0; i < maxLength; i++) {
        for (const arr of arrays) {
            if (i < arr.length) {
                const book = arr[i];
                // Use a composite key to avoid duplicates from different sources with the same title/author
                const compositeKey = `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;
                if (!idSet.has(compositeKey)) {
                    result.push(book);
                    idSet.add(compositeKey);
                }
            }
        }
    }
    return result;
}

/**
 * Searches all configured online book sources in parallel.
 * Implements a "Circuit Breaker" pattern using Promise.allSettled to ensure
 * that if one API fails, the others can still return results.
 * @param query The search query string.
 * @param language The language for the search.
 * @param enabledSources List of sources to query.
 * @returns A promise that resolves with the list of LibraryBooks.
 */
export async function searchBooks(
    query: string, 
    language: 'en' | 'de', 
    enabledSources: LibrarySource[] = ['gutenberg', 'openlibrary']
): Promise<LibraryBook[]> {
    const searchPromises: Promise<LibraryBook[]>[] = [];
    const sourceMap: string[] = []; // To track which index belongs to which source for logging

    if (enabledSources.includes('gutenberg')) {
        searchPromises.push(gutendexService.fetchPublicBooks(language, undefined, query).then(adaptGutendex));
        sourceMap.push('Gutenberg');
    }
    
    if (enabledSources.includes('openlibrary')) {
        searchPromises.push(openLibraryService.fetchPublicBooks(language, 1, query).then(adaptOpenLibrary));
        sourceMap.push('OpenLibrary');
    }

    if (searchPromises.length === 0) {
        return [];
    }

    const results = await Promise.allSettled(searchPromises);

    const successfulResults: LibraryBook[][] = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            successfulResults.push(result.value);
        } else {
            // Log as warning instead of error to prevent alarm during partial outages/timeouts
            console.warn(`Search skipped for source: ${sourceMap[index]}`, result.reason);
        }
    });

    // The order here matters for interleaving: typically prioritize Gutenberg if available.
    return interleaveBooks(...successfulResults);
}
