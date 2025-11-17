import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings, GenerationSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'comicGenSettings';

const defaultState: AppSettings = {
  showSpeechBubbles: true,
  speechBubbles: {
    style: 'rounded',
    fontSize: 16,
    fontFamily: "'Bangers', cursive",
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    opacity: 0.9,
    ttsVoice: 'Zephyr', // Added default TTS voice
  },
  generation: {
    layoutAlgorithm: 'squarified',
    imageQuality: 'high',
    artStyle: 'default',
    negativePrompt: 'blurry, text, watermark, signature',
    aspectRatio: '1:1',
    gutterWidth: 20,
    pageBorder: {
      enabled: false,
      color: '#111827',
    },
  },
};

const getInitialState = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Deep merge to ensure nested objects are populated correctly
      return {
        ...defaultState,
        ...parsed,
        speechBubbles: {
          ...defaultState.speechBubbles,
          ...parsed.speechBubbles,
        },
        generation: {
          ...defaultState.generation,
          ...parsed.generation,
          pageBorder: {
            ...defaultState.generation.pageBorder,
            ...parsed.generation?.pageBorder,
          },
        },
      };
    }
  } catch (e) {
    console.error('Could not load settings from local storage', e);
  }
  return defaultState;
};

const initialState: AppSettings = getInitialState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      Object.assign(state, action.payload);
    },
    updateGenerationSettings(
      state,
      action: PayloadAction<Partial<GenerationSettings>>,
    ) {
      state.generation = { ...state.generation, ...action.payload };
    },
  },
});

export const { updateSettings, updateGenerationSettings } =
  settingsSlice.actions;
export default settingsSlice.reducer;
