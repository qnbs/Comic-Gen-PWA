import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import type { StoredComic, ComicPageData } from '../types';
import { resetApp } from './generationSlice';
import { AppDispatch } from '../app/store';

export const fetchComics = createAsyncThunk<
  StoredComic[],
  void,
  { rejectValue: string }
>('library/fetchComics', async (_, { rejectWithValue }) => {
  try {
    return await dbService.getComics();
  } catch (err: unknown) {
    return rejectWithValue('Failed to load comics.');
  }
});

export const saveComicToLibrary = createAsyncThunk<
  StoredComic,
  { page: ComicPageData; title: string; language: 'en' | 'de' },
  { rejectValue: string }
>(
  'library/saveComicToLibrary',
  async ({ page, title, language }, { rejectWithValue }) => {
    try {
      const newComic: StoredComic = {
        id: `comic-${Date.now()}`,
        title,
        createdAt: new Date(),
        page,
        language,
      };
      await dbService.saveComic(newComic);
      return newComic;
    } catch (err: unknown) {
      return rejectWithValue('Failed to save comic.');
    }
  },
);

export const deleteComicFromLibrary = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('library/deleteComic', async (id, { rejectWithValue }) => {
  try {
    await dbService.deleteComic(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete comic.');
  }
});

export const deleteMultipleComicsFromLibrary = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>('library/deleteMultipleComics', async (ids, { rejectWithValue }) => {
  try {
    await dbService.deleteMultipleComics(ids);
    return ids;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete selected comics.');
  }
});

export const clearAllData = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('library/clearAllData', async (_, { dispatch }) => {
  await dbService.clearAllComics();
  dispatch(resetApp());
});

interface LibraryState {
  comics: StoredComic[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LibraryState = {
  comics: [],
  status: 'idle',
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.comics = action.payload;
      })
      .addCase(fetchComics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(saveComicToLibrary.fulfilled, (state, action) => {
        state.comics.unshift(action.payload); // Add new comic to the start of the list
      })
      .addCase(deleteComicFromLibrary.fulfilled, (state, action) => {
        state.comics = state.comics.filter(
          (comic) => comic.id !== action.payload,
        );
      })
      .addCase(deleteMultipleComicsFromLibrary.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload);
        state.comics = state.comics.filter((comic) => !deletedIds.has(comic.id));
      })
      .addCase(clearAllData.fulfilled, (state) => {
        state.comics = [];
        state.status = 'idle';
      });
  },
});

export default librarySlice.reducer;
