
export enum ProjectGenerationState {
  PROJECT_SETUP = 'PROJECT_SETUP',
  GLOBAL_ANALYSIS = 'GLOBAL_ANALYSIS', // New step for overall book analysis
  CHAPTER_REVIEW = 'CHAPTER_REVIEW',
  WORLD_BUILDING = 'WORLD_BUILDING', // New pre-production step
  PAGE_LAYOUT = 'PAGE_LAYOUT',
  GENERATING_PAGES = 'GENERATING_PAGES',
  VIEWING_PAGES = 'VIEWING_PAGES',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface Scene {
  originalText: string;
  summary: string;
  characters: string[];
  props: string[];
  dialogue: string;
  visualPrompt: string;
  actionScore: number;
}

export interface Pose {
  id: string;
  name: string; // e.g., "Angry", "Fighting Stance"
  description: string;
  referenceImageId: string | null; // Changed from referenceImageUrl
}

export interface Character {
  name: string;
  description: string;
  referenceImageId: string | null; // Changed from referenceImageUrl
  poses: Pose[]; // The pose/expression library for this character
}

// NEW: For locations, props, etc.
export interface WorldAsset {
  name: string;
  description: string;
  referenceImageId: string | null; // Changed from referenceImageUrl
}

// NEW: A database for all consistent visual elements
export interface WorldDB {
  characters: Character[];
  locations: WorldAsset[];
  props: WorldAsset[];
}

export interface PanelData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageId: string; // ID referencing a blob in the media_blobs store
  dialogue: string;
  sceneId: string; // Globally unique ID for the source scene (e.g., 'c0-s3')
  originalVisualPrompt: string;
  videoId?: string; // ID referencing a video blob
  audioId?: string; // ID referencing an audio blob
}

export interface ComicBookPage {
  pageNumber: number;
  panels: PanelData[];
}

// NEW: A chapter holds the text and its scene breakdown
export interface Chapter {
  chapterIndex: number;
  title: string;
  originalText: string;
  scenes: string[]; // Array of Scene IDs
}

// Metadata stored for quick library listing
export interface ComicProjectMeta {
  id: string;
  title: string;
  createdAt: Date;
  thumbnailId?: string;
}

// NEW: The core data structure for a full comic book project
export interface ComicProject extends ComicProjectMeta {
  originalFullText: string;
  language: 'en' | 'de';
  chapters: Chapter[];
  worldDB: WorldDB;
  pages: ComicBookPage[];
  // Project-level settings can go here
}

// NEW: Intermediate types for type-safe project creation
export interface ChapterWithScenes extends Omit<Chapter, 'scenes'> {
  scenes: Scene[];
}

export interface UnnormalizedComicProject extends Omit<ComicProject, 'chapters'> {
  chapters: ChapterWithScenes[];
}


export type LayoutAlgorithm =
  | 'squarified'
  | 'strip'
  | 'binary'
  | 'grid'
  | 'column';
export type ImageQuality = 'low' | 'medium' | 'high';
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
export type ArtStyle = string; // Changed from enum-like type to allow custom styles
export type SpeechBubbleStyle = 'rounded' | 'sharp' | 'cloud';
export type SpeechBubblePlacement = 'physics' | 'static';
export type ImageModel = 'gemini-3-pro' | 'nano-banana' | 'imagen-4';

export interface SpeechBubbleSettings {
  style: SpeechBubbleStyle;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  ttsVoice: string;
  placementAlgorithm: SpeechBubblePlacement;
}

export interface PageBorderSettings {
  enabled: boolean;
  color: string;
}

export interface AdvancedGenerationSettings {
  seed?: number | null;
  temperature: number;
  topK: number;
  topP: number;
}

export interface GenerateImageConfig extends AdvancedGenerationSettings {
  numberOfImages: number;
  outputMimeType: 'image/jpeg';
  aspectRatio: AspectRatio;
  seed?: number; // Overwrite seed to be optional
}

export interface VideoSettings {
  resolution: '720p' | '1080p';
  motion: 'low' | 'medium' | 'high';
}

export interface GenerationSettings {
  imageModel: ImageModel; // New field for model selection
  layoutAlgorithm: LayoutAlgorithm;
  imageQuality: ImageQuality;
  artStyle: ArtStyle;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  gutterWidth: number;
  pageBorder: PageBorderSettings;
  panelDensity: 'low' | 'medium' | 'high';
  advanced: AdvancedGenerationSettings;
  video: VideoSettings;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
}

export interface DataSettings {
  autoSave: boolean;
}

export interface AppSettings {
  showSpeechBubbles: boolean;
  speechBubbles: SpeechBubbleSettings;
  generation: GenerationSettings;
  accessibility: AccessibilitySettings;
  data: DataSettings;
}

export interface Preset extends GenerationSettings {
  id?: number;
  name: string;
}

// NEW: Word Cloud Analysis types
export interface WordCloudEntry {
  text: string;
  size: number;
}
export interface WordCloudAnalysis {
  overall: WordCloudEntry[];
  characters: { name: string; words: WordCloudEntry[] }[];
  locations: { name: string; words: WordCloudEntry[] }[];
  events: { name: string; words: WordCloudEntry[] }[];
}

export type LibrarySource = 'gutenberg' | 'openlibrary';

// A generic book type for online libraries
export interface LibraryBook {
  id: string; // Gutenberg ID as string, or OpenLibrary work key
  source: LibrarySource;
  title: string;
  author: string;
  coverImageUrl?: string;
  sourceUrl?: string;
  // Source-specific fields
  textUrl?: string; // Gutenberg, Wikimedia, or Google Books preview link
  iaId?: string; // OpenLibrary Internet Archive ID
  // Local fields
  isLocal?: boolean;
  fullText?: string;
  // NEW: Fields for book management
  notes?: string;
  tags?: string[];
  analysisCache?: WordCloudAnalysis | null;
}


// --- Type definitions for CDN-loaded libraries ---

// For jsPDF v2.5.1 UMD
interface jsPDFOptions {
  returnPromise?: boolean;
}

interface jsPDFHTMLOptions {
  callback: (doc: jsPDF) => void;
  x?: number;
  y?: number;
}
interface jsPDF {
  addImage(
    imageData: string | HTMLCanvasElement,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alias?: string,
    compression?: string,
    rotation?: number,
  ): this;
  save(filename: string, options?: jsPDFOptions): Promise<void>;
  html(element: HTMLElement, options?: jsPDFHTMLOptions): Promise<void>;
  addPage(): this;
}

// For html2canvas v1.4.1
interface Html2CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string | null;
}
declare function html2canvas(
  element: HTMLElement,
  options?: Html2CanvasOptions,
): Promise<HTMLCanvasElement>;

// FIX: To resolve a "Subsequent property declarations must have the same type" error,
// the AIStudio interface is moved inside `declare global`. This ensures it's treated
// as a unique global type, preventing conflicts from module-scoped declarations.
declare global {
  // For Veo API key selection
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    jspdf: {
      jsPDF: new (options?: {
        orientation?: 'p' | 'portrait' | 'l' | 'landscape';
        unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm';
        format?: string | number[];
      }) => jsPDF;
    };
    html2canvas: typeof html2canvas;
    aistudio?: AIStudio;
    webkitAudioContext?: typeof AudioContext; // Add this for Safari compatibility
  }
}