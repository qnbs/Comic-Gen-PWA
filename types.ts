export enum GenerationState {
  IDLE = "IDLE",
  ANALYZING_TEXT = "ANALYZING_TEXT",
  REVIEW_SCENES = "REVIEW_SCENES",
  CHARACTER_DEFINITION = "CHARACTER_DEFINITION",
  GENERATING_IMAGES = "GENERATING_IMAGES",
  COMPOSING = "COMPOSING",
  DONE = "DONE",
  ERROR = "ERROR",
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
}

export interface ComicPageData {
  panels: PanelData[];
}

export type LayoutAlgorithm = 'squarified' | 'strip' | 'binary';
export type ImageQuality = 'low' | 'medium' | 'high';
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export interface AppSettings {
    showSpeechBubbles: boolean;
    layoutAlgorithm: LayoutAlgorithm;
    speechBubbleFontSize: number;
    speechBubbleFontFamily: string;
    imageQuality: ImageQuality;
    aspectRatio: AspectRatio;
}

export interface StoredComic {
    id: string;
    title: string;
    createdAt: Date;
    page: ComicPageData;
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
}

// Declarations for CDN-loaded libraries
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}
