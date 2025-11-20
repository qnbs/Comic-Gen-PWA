
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import * as bookSearchService from '../services/bookSearchService';
import * as gutendexService from '../services/gutendexService';
import * as openLibraryService from '../services/openLibraryService';
import * as geminiService from '../services/geminiService';
import type { LibraryBook, WordCloudAnalysis, LibrarySource } from '../types';
import { RootState, AppDispatch } from '../app/store';

// Thunks
export const fetchLocalBooks = createAsyncThunk<
  LibraryBook[],
  void,
  { rejectValue: string }
>('libraryBrowser/fetchLocalBooks', async (_, { rejectWithValue }) => {
  try {
    const books = await dbService.getLibraryBooks();
    return books.map((b) => ({ ...b, isLocal: true }));
  } catch (err) {
    return rejectWithValue('Failed to load local library.');
  }
});

export const searchOnlineBooks = createAsyncThunk<
  LibraryBook[],
  void,
  { rejectValue: string; state: RootState }
>('libraryBrowser/searchOnlineBooks', async (_, { getState, rejectWithValue }) => {
  const { ui, libraryBrowser } = getState();
  const searchQuery = libraryBrowser.onlineSearchQuery;
  const enabledSources = libraryBrowser.enabledSources;

  try {
    return await bookSearchService.searchBooks(searchQuery, ui.language, enabledSources);
  } catch (err) {
    return rejectWithValue(
      err instanceof Error
        ? err.message
        : 'An unknown error occurred during the online search.',
    );
  }
});

export const downloadBookToLibrary = createAsyncThunk<
  LibraryBook, // Returns the saved book
  LibraryBook, // Takes the online book as argument
  { rejectValue: string; dispatch: AppDispatch }
>(
  'libraryBrowser/downloadBookToLibrary',
  async (book, { rejectWithValue, dispatch }) => {
    try {
      let fullText = '';
      switch (book.source) {
        case 'openlibrary':
          if (!book.iaId) return rejectWithValue(`No Internet Archive ID for "${book.title}".`);
          fullText = await openLibraryService.fetchBookText(book.iaId);
          break;
        case 'gutenberg':
           // Uses the robust fallback fetcher specifically for Gutenberg ID
           fullText = await gutendexService.fetchBookTextWithFallbacks(book.id);
           break;
        default:
           return rejectWithValue(`Unknown or unsupported source for "${book.title}".`);
      }
      
      if (!fullText || fullText.length < 100) {
          return rejectWithValue('Downloaded text was empty or too short to be valid.');
      }

      const bookToSave: LibraryBook = { ...book, fullText };
      await dbService.saveLibraryBook(bookToSave);
      return { ...bookToSave, isLocal: true };
    } catch (err) {
        const message = `Failed to download "${book.title}": ${err instanceof Error ? err.message : 'An unknown error occurred.'}`;
        console.error(message);
        return rejectWithValue(message);
    }
  },
);

export const deleteBookFromLibrary = createAsyncThunk<
  string, // Returns the deleted book's ID
  string, // Takes the book ID as argument
  { rejectValue: string; dispatch: AppDispatch }
>(
  'libraryBrowser/deleteBookFromLibrary',
  async (bookId, { rejectWithValue, dispatch }) => {
    try {
      await dbService.deleteLibraryBook(bookId);
      return bookId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete book from library.';
      return rejectWithValue(message);
    }
  },
);

export const updateBookMetadata = createAsyncThunk<
  LibraryBook,
  { bookId: string; updates: Partial<Pick<LibraryBook, 'notes' | 'tags' | 'fullText'>> },
  { rejectValue: string; dispatch: AppDispatch; state: RootState }
>(
  'libraryBrowser/updateBookMetadata',
  async ({ bookId, updates }, { dispatch, getState, rejectWithValue }) => {
    const { libraryBrowser } = getState();
    const book = libraryBrowser.localBooks.find(b => b.id === bookId);
    if (!book) {
      return rejectWithValue('Book not found in local library.');
    }
    try {
      const updatedBook = { ...book, ...updates };
      await dbService.saveLibraryBook(updatedBook);
      return updatedBook;
    } catch(err) {
      const message = err instanceof Error ? err.message : 'Failed to update book.';
      return rejectWithValue(message);
    }
  }
);

export const analyzeBookForWordCloud = createAsyncThunk<
  { bookId: string; analysis: WordCloudAnalysis },
  string, // bookId
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'libraryBrowser/analyzeBookForWordCloud',
  async (bookId, { getState, rejectWithValue, dispatch }) => {
    const { libraryBrowser, ui } = getState();
    const book = libraryBrowser.localBooks.find(b => b.id === bookId);
    if (!book || !book.fullText) {
        return rejectWithValue('Book text not available for analysis.');
    }
    try {
        const analysis = await geminiService.generateWordCloudAnalysis(book.fullText, ui.language);
        const updatedBook = { ...book, analysisCache: analysis };
        await dbService.saveLibraryBook(updatedBook);
        return { bookId, analysis };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate word cloud analysis.';
        return rejectWithValue(message);
    }
  }
);


// State
interface LibraryBrowserState {
  localBooks: LibraryBook[];
  onlineBooks: LibraryBook[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  onlineStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  downloadStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'error'>;
  analysisStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  metadataUpdateStatus: 'idle' | 'saving' | 'saved' | 'error';
  onlineSearchQuery: string;
  enabledSources: LibrarySource[];
  error: string | null;
  selectedBookId: string | null;
}

const initialState: LibraryBrowserState = {
  localBooks: [],
  onlineBooks: [],
  status: 'idle',
  onlineStatus: 'idle',
  downloadStatus: {},
  analysisStatus: {},
  metadataUpdateStatus: 'idle',
  onlineSearchQuery: '',
  enabledSources: ['gutenberg', 'openlibrary'],
  error: null,
  selectedBookId: null,
};

// Slice
const libraryBrowserSlice = createSlice({
  name: 'libraryBrowser',
  initialState,
  reducers: {
    setSelectedBookId(state, action: PayloadAction<string | null>) {
      state.selectedBookId = action.payload;
    },
    setOnlineSearchQuery(state, action: PayloadAction<string>) {
      state.onlineSearchQuery = action.payload;
    },
    toggleSource(state, action: PayloadAction<LibrarySource>) {
        const source = action.payload;
        if (state.enabledSources.includes(source)) {
            // Prevent unselecting the last source
            if (state.enabledSources.length > 1) {
                state.enabledSources = state.enabledSources.filter(s => s !== source);
            }
        } else {
            state.enabledSources.push(source);
        }
    },
    resetMetadataUpdateStatus(state) {
        state.metadataUpdateStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Local
      .addCase(fetchLocalBooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocalBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.localBooks = action.payload;
      })
      .addCase(fetchLocalBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      // Search Online
      .addCase(searchOnlineBooks.pending, (state) => {
        state.onlineStatus = 'loading';
        state.onlineBooks = [];
      })
      .addCase(searchOnlineBooks.fulfilled, (state, action) => {
        state.onlineStatus = 'succeeded';
        state.onlineBooks = action.payload;
      })
      .addCase(searchOnlineBooks.rejected, (state, action) => {
        state.onlineStatus = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      // Download
      .addCase(downloadBookToLibrary.pending, (state, action) => {
        state.downloadStatus[action.meta.arg.id] = 'loading';
      })
      .addCase(downloadBookToLibrary.fulfilled, (state, action) => {
        state.downloadStatus[action.payload.id] = 'succeeded';
        if (!state.localBooks.some((b) => b.id === action.payload.id)) {
          state.localBooks.unshift(action.payload);
        }
      })
      .addCase(downloadBookToLibrary.rejected, (state, action) => {
        state.downloadStatus[action.meta.arg.id] = 'error';
        state.error = action.payload ?? 'Unknown download error';
      })
      .addCase(deleteBookFromLibrary.fulfilled, (state, action) => {
        state.localBooks = state.localBooks.filter(book => book.id !== action.payload);
        if (state.selectedBookId === action.payload) {
          state.selectedBookId = null;
        }
      })
      .addCase(deleteBookFromLibrary.rejected, (state, action) => {
          state.error = action.payload ?? 'Unknown deletion error';
      })
      // Update Metadata
      .addCase(updateBookMetadata.pending, (state) => {
          state.metadataUpdateStatus = 'saving';
      })
      .addCase(updateBookMetadata.fulfilled, (state, action) => {
        const index = state.localBooks.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
            state.localBooks[index] = action.payload;
        }
        state.metadataUpdateStatus = 'saved';
      })
      .addCase(updateBookMetadata.rejected, (state) => {
          state.metadataUpdateStatus = 'error';
      })
      // Word Cloud Analysis
      .addCase(analyzeBookForWordCloud.pending, (state, action) => {
        state.analysisStatus[action.meta.arg] = 'loading';
      })
      .addCase(analyzeBookForWordCloud.fulfilled, (state, action) => {
        const index = state.localBooks.findIndex(b => b.id === action.payload.bookId);
        if (index !== -1) {
            state.localBooks[index].analysisCache = action.payload.analysis;
        }
        state.analysisStatus[action.payload.bookId] = 'succeeded';
      })
      .addCase(analyzeBookForWordCloud.rejected, (state, action) => {
        state.analysisStatus[action.meta.arg] = 'failed';
        state.error = action.payload ?? 'Unknown analysis error';
      });
  },
});

export const { setSelectedBookId, setOnlineSearchQuery, toggleSource, resetMetadataUpdateStatus } = libraryBrowserSlice.actions;

export default libraryBrowserSlice.reducer;