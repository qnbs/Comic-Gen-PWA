import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../app/store';
import { ComicProject } from '../types';
import * as exportService from '../services/exportService';

type Page = 'creator' | 'settings' | 'help' | 'library';
type Theme = 'light' | 'dark';
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('comicGenTheme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme as Theme;
  }
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'dark'; // Default to dark mode
};

export const exportProjectAsPdf = createAsyncThunk<
  void,
  { project: ComicProject },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'ui/exportProjectAsPdf',
  async ({ project }, { dispatch, getState, rejectWithValue }) => {
    if (!project || project.pages.length === 0) {
      const message = 'No pages in the project to export.';
      dispatch(addToast({ message, type: 'error' }));
      return rejectWithValue(message);
    }
    dispatch(setIsExportingPdf(true));
    try {
      const { settings } = getState();
      await exportService.exportProjectAsPdf(project, settings);
      dispatch(
        addToast({ message: 'PDF exported successfully!', type: 'success' }),
      );
    } catch (err: unknown) {
      console.error('PDF Export failed:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to export PDF.';
      dispatch(addToast({ message, type: 'error' }));
      return rejectWithValue(message);
    } finally {
      dispatch(setIsExportingPdf(false));
    }
  },
);

export const exportProjectAsCbz = createAsyncThunk<
  void,
  { project: ComicProject },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>('ui/exportProjectAsCbz', async ({ project }, { dispatch, getState, rejectWithValue }) => {
  if (!project || project.pages.length === 0) {
    const message = 'No pages available to export.';
    dispatch(addToast({ message, type: 'error' }));
    return rejectWithValue(message);
  }
  dispatch(setIsDownloading(true));
  try {
    const { settings } = getState();
    await exportService.exportProjectAsCbz(project, settings);
    dispatch(addToast({ message: 'CBZ file downloaded!', type: 'success' }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export CBZ.';
    dispatch(addToast({ message, type: 'error' }));
    return rejectWithValue(message);
  } finally {
    dispatch(setIsDownloading(false));
  }
});

interface UiState {
  currentPage: Page;
  theme: Theme;
  isDownloading: boolean;
  isExportingPdf: boolean;
  isExportingZip: boolean; // Retain for potential single-panel zipping in future
  language: 'en' | 'de';
  toasts: Toast[];
}

const getInitialLanguage = (): 'en' | 'de' => {
  const savedLang = localStorage.getItem('comic-gen-lang');
  if (savedLang === 'en' || savedLang === 'de') {
    return savedLang;
  }
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'de') {
    return 'de';
  }
  return 'en';
};

const initialState: UiState = {
  currentPage: 'creator',
  theme: getInitialTheme(),
  isDownloading: false,
  isExportingPdf: false,
  isExportingZip: false,
  language: getInitialLanguage(),
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage(state, action: PayloadAction<Page>) {
      state.currentPage = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<'en' | 'de'>) {
      state.language = action.payload;
      localStorage.setItem('comic-gen-lang', action.payload);
    },
    setIsDownloading(state, action: PayloadAction<boolean>) {
      state.isDownloading = action.payload;
    },
    setIsExportingZip(state, action: PayloadAction<boolean>) {
      state.isExportingZip = action.payload;
    },
    setIsExportingPdf(state, action: PayloadAction<boolean>) {
      state.isExportingPdf = action.payload;
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      const newToast = { id: new Date().toISOString() + Math.random(), ...action.payload };
      state.toasts.push(newToast);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setCurrentPage,
  setTheme,
  setLanguage,
  setIsDownloading,
  setIsExportingZip,
  setIsExportingPdf,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;
