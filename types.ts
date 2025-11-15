export enum GenerationState {
  IDLE = 'IDLE',
  SEGMENTING_SCENES = 'SEGMENTING_SCENES',
  ANALYZING_TEXT = 'ANALYZING_TEXT',
  REVIEW_SCENES = 'REVIEW_SCENES',
  CHARACTER_DEFINITION = 'CHARACTER_DEFINITION',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  COMPOSING = 'COMPOSING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface Scene {
  originalText: string;
  summary: string;
  characters: string[];
  dialogue: string;
  visualPrompt: string;
  actionScore: number;
}

export interface Character {
  name: string;
  description: string;
  referenceImageUrl: string | null;
}

export interface PanelData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  dialogue: string;
  // New properties for regeneration
  sceneIndex: number;
  originalVisualPrompt: string;
}

export interface ComicPageData {
  panels: PanelData[];
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

export interface StoredComic {
  id: string;
  title: string;
  createdAt: Date;
  page: ComicPageData;
  language: 'en' | 'de';
}

export interface SavedProgress {
  generationState: GenerationState;
  originalText: string;
  scenes: Scene[]; // Now represents the latest scenes after review
  sceneHistory: Scene[][];
  sceneHistoryIndex: number;
  characterHistory: Character[][];
  characterHistoryIndex: number;
  timestamp: number;
  language: 'en' | 'de';
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
}

// For html2canvas v1.4.1
interface Html2CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  // FIX: Add backgroundColor property to align with html2canvas library options.
  backgroundColor?: string | null;
}
declare function html2canvas(
  element: HTMLElement,
  options?: Html2CanvasOptions,
): Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: {
        orientation?: 'p' | 'portrait' | 'l' | 'landscape';
        unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm';
        format?: string | number[];
      }) => jsPDF;
    };
    html2canvas: typeof html2canvas;
  }
}
