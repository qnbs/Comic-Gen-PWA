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
  referenceImageUrl: string | null;
}

export interface Character {
  name: string;
  description: string;
  referenceImageUrl: string | null;
  poses: Pose[]; // The pose/expression library for this character
}

// NEW: For locations, props, etc.
export interface WorldAsset {
  name: string;
  description: string;
  referenceImageUrl: string | null;
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
  imageUrl: string;
  dialogue: string;
  sceneIndex: number; // Index within its chapter
  originalVisualPrompt: string;
  // NEW: Fields for video and audio features
  videoUrl?: string;
  isVideo?: boolean;
  audioUrl?: string;
}

export interface ComicBookPage {
  pageNumber: number;
  panels: PanelData[];
}

// Add ComicPageData as an alias for ComicBookPage for backward compatibility with legacy comic handling.
export type ComicPageData = ComicBookPage;

// NEW: A chapter holds the text and its scene breakdown
export interface Chapter {
  chapterIndex: number;
  title: string;
  originalText: string;
  scenes: Scene[];
}

// NEW: The core data structure for a full comic book project
export interface ComicProject {
  id: string;
  title: string;
  originalFullText: string;
  createdAt: Date;
  language: 'en' | 'de';
  chapters: Chapter[];
  worldDB: WorldDB;
  pages: ComicBookPage[];
  // Project-level settings can go here
}

export type LayoutAlgorithm =
  | 'squarified'
  | 'strip'
  | 'binary'
  | 'grid'
  | 'column';
export type ImageQuality = 'low' | 'medium' | 'high';
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
export type ArtStyle =
  | 'default'
  | 'manga'
  | 'noir'
  | 'watercolor'
  | 'cyberpunk';
export type SpeechBubbleStyle = 'rounded' | 'sharp' | 'cloud';

export interface SpeechBubbleSettings {
  style: SpeechBubbleStyle;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  opacity: number; // 0 to 1
  ttsVoice: string; // NEW: For TTS voice selection
}

export interface PageBorderSettings {
  enabled: boolean;
  color: string;
}

export interface GenerationSettings {
  layoutAlgorithm: LayoutAlgorithm;
  imageQuality: ImageQuality;
  artStyle: ArtStyle;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  gutterWidth: number;
  pageBorder: PageBorderSettings;
}

export interface AppSettings {
  showSpeechBubbles: boolean;
  speechBubbles: SpeechBubbleSettings;
  generation: GenerationSettings;
}

export interface Preset extends GenerationSettings {
  id?: number;
  name: string;
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
