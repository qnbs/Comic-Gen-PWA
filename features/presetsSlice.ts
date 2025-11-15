import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import type { Preset, GenerationSettings } from '../types';
import { updateGenerationSettings } from './settingsSlice';
import { AppDispatch } from '../app/store';

export const loadPresets = createAsyncThunk<
  Preset[],
  void,
  { rejectValue: string }
>('presets/loadPresets', async (_, { rejectWithValue }) => {
  try {
    return await dbService.getPresets();
  } catch (err: unknown) {
    return rejectWithValue('Failed to load presets.');
  }
});

export const savePreset = createAsyncThunk<
  Preset,
  { name: string; settings: GenerationSettings },
  { rejectValue: string }
>('presets/savePreset', async ({ name, settings }, { rejectWithValue }) => {
  try {
    const newPreset: Omit<Preset, 'id'> = { name, ...settings };
    return await dbService.savePreset(newPreset);
  } catch (err: unknown) {
    return rejectWithValue('Failed to save preset.');
  }
});

export const deletePreset = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('presets/deletePreset', async (id, { rejectWithValue }) => {
  try {
    await dbService.deletePreset(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete preset.');
  }
});

export const applyPreset = createAsyncThunk<void, Preset, { dispatch: AppDispatch }>(
  'presets/applyPreset',
  async (preset, { dispatch }) => {
    const { id, name, ...generationSettings } = preset;
    dispatch(updateGenerationSettings(generationSettings));
  },
);

interface PresetsState {
  presets: Preset[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PresetsState = {
  presets: [],
  status: 'idle',
  error: null,
};

const presetsSlice = createSlice({
  name: 'presets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPresets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadPresets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.presets = action.payload;
      })
      .addCase(loadPresets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(savePreset.fulfilled, (state, action) => {
        state.presets.push(action.payload);
      })
      .addCase(deletePreset.fulfilled, (state, action) => {
        state.presets = state.presets.filter((p) => p.id !== action.payload);
      });
  },
});

export default presetsSlice.reducer;
