import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import type { Preset, GenerationSettings } from '../types';
import { updateGenerationSettings } from './settingsSlice';
import { addToast } from './uiSlice';
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
  { rejectValue: string; dispatch: AppDispatch }
>('presets/savePreset', async ({ name, settings }, { rejectWithValue, dispatch }) => {
  try {
    const newPreset: Omit<Preset, 'id'> = { name, ...settings };
    const saved = await dbService.savePreset(newPreset);
    dispatch(addToast({ message: `Preset "${saved.name}" saved!`, type: 'success' }));
    return saved;
  } catch (err: unknown) {
    const message = 'Failed to save preset.';
    dispatch(addToast({ message, type: 'error' }));
    return rejectWithValue(message);
  }
});

export const deletePreset = createAsyncThunk<
  number,
  number,
  { rejectValue: string; dispatch: AppDispatch }
>('presets/deletePreset', async (id, { rejectWithValue, dispatch }) => {
  try {
    await dbService.deletePreset(id);
    dispatch(addToast({ message: `Preset deleted.`, type: 'success' }));
    return id;
  } catch (err: unknown) {
    const message = 'Failed to delete preset.';
    dispatch(addToast({ message, type: 'error' }));
    return rejectWithValue(message);
  }
});

export const applyPreset = createAsyncThunk<void, Preset, { dispatch: AppDispatch }>(
  'presets/applyPreset',
  async (preset, { dispatch }) => {
    const { id, name, ...generationSettings } = preset;
    dispatch(updateGenerationSettings(generationSettings));
    dispatch(addToast({ message: `Preset "${name}" applied.`, type: 'info' }));
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
