import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../app/store';
import JSZip from 'jszip';

type Page = 'creator' | 'settings' | 'help' | 'library';
type Theme = 'light' | 'dark';

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

export const exportPageAsPdf = createAsyncThunk<
  void,
  { pageElement: HTMLDivElement },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'ui/exportPageAsPdf',
  async ({ pageElement }, { dispatch, getState, rejectWithValue }) => {
    const { originalText } = getState().generation;
    if (!pageElement) {
      return rejectWithValue('Comic page element not found.');
    }
    dispatch(setIsExportingPdf(true));
    try {
      const canvas = await window.html2canvas(pageElement, {
        scale: 2, // Increase scale for better resolution
        useCORS: true,
        backgroundColor: null, // Use transparent background to respect dark mode
      });

      const imgData = canvas.toDataURL('image/png');
      // Use page dimensions for PDF format
      const pdf = new window.jspdf.jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [pageElement.offsetWidth, pageElement.offsetHeight],
      });

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pageElement.offsetWidth,
        pageElement.offsetHeight,
      );

      const title = originalText.substring(0, 20) || 'comic';
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      await pdf.save(`${safeTitle}.pdf`, { returnPromise: true });
    } catch (err: unknown) {
      console.error('PDF Export failed:', err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to export PDF.',
      );
    } finally {
      dispatch(setIsExportingPdf(false));
    }
  },
);

export const exportPanelsAsZip = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: RootState }
>('ui/exportPanelsAsZip', async (_, { dispatch, getState, rejectWithValue }) => {
  const { comicPage, originalText } = getState().generation;
  if (!comicPage) {
    return rejectWithValue('No comic page available to export.');
  }
  dispatch(setIsExportingZip(true));
  try {
    const zip = new JSZip();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    for (let i = 0; i < comicPage.panels.length; i++) {
      const panel = comicPage.panels[i];
      const response = await fetch(panel.imageUrl);
      const jpegBlob = await response.blob();

      const image = await createImageBitmap(jpegBlob);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const pngBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );
      if (!pngBlob) throw new Error(`Failed to convert panel ${i + 1} to PNG.`);

      zip.file(`panel_${i + 1}.png`, pngBlob);
    }

    const title = originalText.substring(0, 20) || 'comic';
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_panels.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to export panels as ZIP.',
    );
  } finally {
    dispatch(setIsExportingZip(false));
  }
});

interface UiState {
  currentPage: Page;
  theme: Theme;
  isDownloading: boolean;
  isExportingPdf: boolean;
  isExportingZip: boolean;
  language: 'en' | 'de';
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
    setIsExportingZip(state, action: PayloadAction<boolean>) {
      state.isExportingZip = action.payload;
    },
    setIsExportingPdf(state, action: PayloadAction<boolean>) {
      state.isExportingPdf = action.payload;
    },
  },
});

export const {
  setCurrentPage,
  setTheme,
  setLanguage,
  setIsExportingZip,
  setIsExportingPdf,
} = uiSlice.actions;
export default uiSlice.reducer;
