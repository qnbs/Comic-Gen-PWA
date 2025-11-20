import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AppSettings,
  GenerationSettings,
  SpeechBubbleSettings,
  AccessibilitySettings,
  DataSettings,
} from '../types';

const SETTINGS_STORAGE_KEY = 'comicGenSettings';

const defaultState: AppSettings = {
  showSpeechBubbles: true,
  speechBubbles: {
    style: 'rounded',
    fontSize: 16,
    fontFamily: "'Bangers', cursive",
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 0.9,
    ttsVoice: 'Zephyr',
    placementAlgorithm: 'physics',
  },
  generation: {
    imageModel: 'gemini-3-pro', // Default to the best quality
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
    panelDensity: 'medium',
    advanced: {
      seed: null,
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
    },
    video: {
      resolution: '720p',
      motion: 'medium',
    },
  },
  accessibility: {
    reduceMotion: false,
  },
  data: {
    autoSave: true,
  },
};

const isObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

const mergeDeep = <T extends object>(target: T, source: Partial<T>): T => {
  const output: T = { ...target };

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = (target as T)[key];

        if (isObject(targetValue) && isObject(sourceValue)) {
          // The type assertion is necessary for the recursive call.
          output[key as keyof T] = mergeDeep(targetValue, sourceValue as Partial<typeof targetValue>);
        } else if (sourceValue !== undefined) {
          // Assign if the source value is not another object to merge or undefined.
          output[key as keyof T] = sourceValue as T[keyof T];
        }
      }
    }
  }

  return output;
};


const getInitialState = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return mergeDeep(defaultState, parsed);
    }
  } catch (e: unknown) {
    console.error('Could not load settings from local storage', e);
  }
  return defaultState;
};

const initialState: AppSettings = getInitialState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      return mergeDeep(state, action.payload);
    },
    updateShowSpeechBubbles(state, action: PayloadAction<boolean>) {
      state.showSpeechBubbles = action.payload;
    },
    updateSpeechBubbleSettings(
      state,
      action: PayloadAction<Partial<SpeechBubbleSettings>>,
    ) {
      state.speechBubbles = { ...state.speechBubbles, ...action.payload };
    },
    updateGenerationSettings(
      state,
      action: PayloadAction<Partial<GenerationSettings>>,
    ) {
      state.generation = { ...state.generation, ...action.payload };
    },
    updateAccessibilitySettings(
      state,
      action: PayloadAction<Partial<AccessibilitySettings>>,
    ) {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    updateDataSettings(state, action: PayloadAction<Partial<DataSettings>>) {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export const {
  setSettings,
  updateShowSpeechBubbles,
  updateSpeechBubbleSettings,
  updateGenerationSettings,
  updateAccessibilitySettings,
  updateDataSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;