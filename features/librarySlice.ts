import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import type { ComicProject } from '../types';
import { resetApp } from './generationSlice';
import { AppDispatch } from '../app/store';

export const fetchProjects = createAsyncThunk<
  ComicProject[],
  void,
  { rejectValue: string }
>('library/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    return await dbService.getProjects();
  } catch (err: unknown) {
    return rejectWithValue('Failed to load projects.');
  }
});

export const deleteProjectFromLibrary = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('library/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await dbService.deleteProject(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete project.');
  }
});

export const deleteMultipleProjectsFromLibrary = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>('library/deleteMultipleProjects', async (ids, { rejectWithValue }) => {
  try {
    await dbService.deleteMultipleProjects(ids);
    return ids;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete selected projects.');
  }
});

export const clearAllData = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('library/clearAllData', async (_, { dispatch }) => {
  await dbService.clearAllProjects();
  dispatch(resetApp());
});

interface LibraryState {
  projects: ComicProject[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LibraryState = {
  projects: [],
  status: 'idle',
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(deleteProjectFromLibrary.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload,
        );
      })
      .addCase(deleteMultipleProjectsFromLibrary.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload);
        state.projects = state.projects.filter((project) => !deletedIds.has(project.id));
      })
      .addCase(clearAllData.fulfilled, (state) => {
        state.projects = [];
        state.status = 'idle';
      });
  },
});

export default librarySlice.reducer;