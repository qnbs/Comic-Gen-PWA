import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AppSettings,
  GenerationSettings,
  SpeechBubbleSettings,
  AccessibilitySettings,
  DataSettings,
  LayoutAlgorithm,
  ImageQuality,
  AspectRatio,
  SpeechBubbleStyle,
  SpeechBubblePlacement,
  ImageModel,
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

const enumIncludes = <T extends string>(
  values: readonly T[],
  candidate: unknown,
): candidate is T => typeof candidate === 'string' && values.includes(candidate as T);

const clampNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

const sanitizeHexColor = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value) ? value : fallback;
};

const sanitizeString = (value: unknown, fallback: string, maxLength = 256): string => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
};

const sanitizeSettings = (source: AppSettings): AppSettings => {
  const layoutAlgorithms: LayoutAlgorithm[] = [
    'squarified',
    'strip',
    'binary',
    'grid',
    'column',
  ];
  const imageQualities: ImageQuality[] = ['low', 'medium', 'high'];
  const aspectRatios: AspectRatio[] = ['1:1', '4:3', '3:4', '16:9', '9:16'];
  const bubbleStyles: SpeechBubbleStyle[] = ['rounded', 'sharp', 'cloud'];
  const bubblePlacements: SpeechBubblePlacement[] = ['physics', 'static'];
  const imageModels: ImageModel[] = ['gemini-3-pro', 'nano-banana', 'imagen-4'];
  const panelDensities = ['low', 'medium', 'high'] as const;
  const videoResolutions = ['720p', '1080p'] as const;
  const videoMotions = ['low', 'medium', 'high'] as const;

  const speech = source.speechBubbles;
  const generation = source.generation;

  const seed = generation.advanced.seed;
  const sanitizedSeed =
    typeof seed === 'number' && Number.isFinite(seed)
      ? Math.max(0, Math.floor(seed))
      : null;

  return {
    showSpeechBubbles:
      typeof source.showSpeechBubbles === 'boolean'
        ? source.showSpeechBubbles
        : defaultState.showSpeechBubbles,
    speechBubbles: {
      style: enumIncludes(bubbleStyles, speech.style)
        ? speech.style
        : defaultState.speechBubbles.style,
      fontSize: Math.round(
        clampNumber(
          speech.fontSize,
          8,
          48,
          defaultState.speechBubbles.fontSize,
        ),
      ),
      fontFamily: sanitizeString(
        speech.fontFamily,
        defaultState.speechBubbles.fontFamily,
        120,
      ),
      backgroundColor: sanitizeHexColor(
        speech.backgroundColor,
        defaultState.speechBubbles.backgroundColor,
      ),
      textColor: sanitizeHexColor(
        speech.textColor,
        defaultState.speechBubbles.textColor,
      ),
      strokeColor: sanitizeHexColor(
        speech.strokeColor,
        defaultState.speechBubbles.strokeColor,
      ),
      strokeWidth: Math.round(
        clampNumber(
          speech.strokeWidth,
          0,
          8,
          defaultState.speechBubbles.strokeWidth,
        ),
      ),
      opacity: clampNumber(speech.opacity, 0.1, 1, defaultState.speechBubbles.opacity),
      ttsVoice: sanitizeString(speech.ttsVoice, defaultState.speechBubbles.ttsVoice, 50),
      placementAlgorithm: enumIncludes(bubblePlacements, speech.placementAlgorithm)
        ? speech.placementAlgorithm
        : defaultState.speechBubbles.placementAlgorithm,
    },
    generation: {
      imageModel: enumIncludes(imageModels, generation.imageModel)
        ? generation.imageModel
        : defaultState.generation.imageModel,
      layoutAlgorithm: enumIncludes(layoutAlgorithms, generation.layoutAlgorithm)
        ? generation.layoutAlgorithm
        : defaultState.generation.layoutAlgorithm,
      imageQuality: enumIncludes(imageQualities, generation.imageQuality)
        ? generation.imageQuality
        : defaultState.generation.imageQuality,
      artStyle: sanitizeString(generation.artStyle, defaultState.generation.artStyle, 120),
      negativePrompt: sanitizeString(
        generation.negativePrompt,
        defaultState.generation.negativePrompt,
        600,
      ),
      aspectRatio: enumIncludes(aspectRatios, generation.aspectRatio)
        ? generation.aspectRatio
        : defaultState.generation.aspectRatio,
      gutterWidth: Math.round(
        clampNumber(generation.gutterWidth, 0, 64, defaultState.generation.gutterWidth),
      ),
      pageBorder: {
        enabled:
          typeof generation.pageBorder.enabled === 'boolean'
            ? generation.pageBorder.enabled
            : defaultState.generation.pageBorder.enabled,
        color: sanitizeHexColor(
          generation.pageBorder.color,
          defaultState.generation.pageBorder.color,
        ),
      },
      panelDensity: enumIncludes(panelDensities, generation.panelDensity)
        ? generation.panelDensity
        : defaultState.generation.panelDensity,
      advanced: {
        seed: sanitizedSeed,
        temperature: clampNumber(
          generation.advanced.temperature,
          0,
          1,
          defaultState.generation.advanced.temperature,
        ),
        topK: Math.round(
          clampNumber(generation.advanced.topK, 1, 100, defaultState.generation.advanced.topK),
        ),
        topP: clampNumber(
          generation.advanced.topP,
          0,
          1,
          defaultState.generation.advanced.topP,
        ),
      },
      video: {
        resolution: enumIncludes(videoResolutions, generation.video.resolution)
          ? generation.video.resolution
          : defaultState.generation.video.resolution,
        motion: enumIncludes(videoMotions, generation.video.motion)
          ? generation.video.motion
          : defaultState.generation.video.motion,
      },
    },
    accessibility: {
      reduceMotion:
        typeof source.accessibility.reduceMotion === 'boolean'
          ? source.accessibility.reduceMotion
          : defaultState.accessibility.reduceMotion,
    },
    data: {
      autoSave:
        typeof source.data.autoSave === 'boolean'
          ? source.data.autoSave
          : defaultState.data.autoSave,
    },
  };
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
      return sanitizeSettings(mergeDeep(defaultState, parsed));
    }
  } catch (e: unknown) {
    console.error('Could not load settings from local storage', e);
  }
  return sanitizeSettings(defaultState);
};

const initialState: AppSettings = getInitialState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      return sanitizeSettings(mergeDeep(state, action.payload));
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
    resetSettingsToDefaults() {
      return sanitizeSettings(structuredClone(defaultState));
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
  resetSettingsToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;