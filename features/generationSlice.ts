import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  hierarchy,
  treemap,
  treemapSquarify,
  treemapSliceDice,
  treemapBinary,
  HierarchyRectangularNode,
} from 'd3-hierarchy';
import {
  GenerationState,
  Scene,
  Character,
  ComicPageData,
  SavedProgress,
  PanelData,
} from '../types';
import * as geminiService from '../services/geminiService';
import * as dbService from '../services/db';
import { RootState, AppDispatch } from '../app/store';
import { saveComicToLibrary } from './librarySlice';
import { base64ToBlob } from '../services/utils';

// Thunks for async operations
export const startAnalysis = createAsyncThunk<
  Scene[],
  { text: string; language: 'en' | 'de' },
  { rejectValue: string }
>(
  'generation/startAnalysis',
  async ({ text, language }, { rejectWithValue }) => {
    try {
      const sceneTexts = await geminiService.segmentTextIntoScenes(
        text,
        language,
      );
      if (!sceneTexts || sceneTexts.length === 0) {
        return rejectWithValue('Could not extract any scenes from the text.');
      }
      const analysisPromises = sceneTexts.map((sceneText) =>
        geminiService.analyzeIndividualScene(sceneText, language),
      );
      return await Promise.all(analysisPromises);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred during analysis.',
      );
    }
  },
);

export const generateCharacterSheet = createAsyncThunk<
  { characterName: string; description: string; imageUrl: string },
  { characterName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generateCharacterSheet',
  async ({ characterName, context }, { getState, rejectWithValue }) => {
    const { language } = getState().generation;
    try {
      const { description, imageUrl } =
        await geminiService.generateCharacterSheet(
          characterName,
          context,
          language,
        );
      return { characterName, description, imageUrl };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'Failed to generate character sheet.',
      );
    }
  },
);

export const generateComic = createAsyncThunk<
  { page: ComicPageData; title: string },
  void,
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'generation/generateComic',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const {
      sceneHistory,
      sceneHistoryIndex,
      characterHistory,
      characterHistoryIndex,
      originalText,
      language,
    } = getState().generation;
    const { generation: generationSettings } = getState().settings;
    const scenes = sceneHistory[sceneHistoryIndex];
    const characters = characterHistory[characterHistoryIndex];
    const { layoutAlgorithm, gutterWidth } = generationSettings;
    const PAGE_WIDTH = 1100;
    const PAGE_HEIGHT = 1600;

    try {
      const imageGenerationPromises = scenes.map((scene) => {
        let characterDescriptions = '';
        scene.characters.forEach((charName) => {
          const characterData = characters.find((c) => c.name === charName);
          if (characterData?.description) {
            characterDescriptions += `\n- ${charName}: ${characterData.description}`;
          }
        });

        let promptWithCharacterConsistency = scene.visualPrompt;
        if (characterDescriptions) {
          promptWithCharacterConsistency += `\n\n--- CHARACTER REFERENCE ---\n${characterDescriptions}\nEnsure the characters strictly adhere to these descriptions.`;
        }
        return geminiService.generatePanelImage(
          promptWithCharacterConsistency,
          generationSettings.imageQuality,
          generationSettings.aspectRatio,
          generationSettings.artStyle,
          generationSettings.negativePrompt,
        );
      });
      const base64Images = await Promise.all(imageGenerationPromises);

      let panelsForState: PanelData[] = [];
      let panelsForDb: PanelData[] = [];
      const isTreemapLayout = ['squarified', 'strip', 'binary'].includes(
        layoutAlgorithm,
      );

      if (isTreemapLayout) {
        const root = hierarchy({ name: 'root', children: scenes })
          .sum((d) => (d as Scene).actionScore || 1)
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        const treemapLayout = treemap<Scene>()
          .size([PAGE_WIDTH, PAGE_HEIGHT])
          .padding(gutterWidth);
        if (layoutAlgorithm === 'strip') treemapLayout.tile(treemapSliceDice);
        else if (layoutAlgorithm === 'binary')
          treemapLayout.tile(treemapBinary);
        else treemapLayout.tile(treemapSquarify);

        treemapLayout(root);
        const leaves = root.leaves() as HierarchyRectangularNode<Scene>[];

        panelsForState = leaves.map((leaf, index) => {
          const scene = leaf.data;
          const originalSceneIndex = scenes.findIndex((s) => s === scene);
          const blob = base64ToBlob(base64Images[originalSceneIndex]);
          return {
            id: `panel-${index}`,
            x: leaf.x0,
            y: leaf.y0,
            width: leaf.x1 - leaf.x0,
            height: leaf.y1 - leaf.y0,
            imageUrl: URL.createObjectURL(blob),
            dialogue: scene.dialogue,
            sceneIndex: originalSceneIndex,
            originalVisualPrompt: scene.visualPrompt,
          };
        });
        panelsForDb = leaves.map((leaf, index) => {
          const scene = leaf.data;
          const originalSceneIndex = scenes.findIndex((s) => s === scene);
          return {
            id: `panel-${index}`,
            x: leaf.x0,
            y: leaf.y0,
            width: leaf.x1 - leaf.x0,
            height: leaf.y1 - leaf.y0,
            imageUrl: `data:image/jpeg;base64,${base64Images[originalSceneIndex]}`,
            dialogue: scene.dialogue,
            sceneIndex: originalSceneIndex,
            originalVisualPrompt: scene.visualPrompt,
          };
        });
      } else {
        // Grid and Column layouts
        let geometries: {
          x: number;
          y: number;
          width: number;
          height: number;
        }[] = [];
        if (layoutAlgorithm === 'column') {
          const totalActionScore = scenes.reduce(
            (sum, scene) => sum + (scene.actionScore || 1),
            0,
          );
          const totalGutterHeight = (scenes.length + 1) * gutterWidth;
          const availableHeight = PAGE_HEIGHT - totalGutterHeight;
          let currentY = gutterWidth;

          geometries = scenes.map((scene) => {
            const panelHeight =
              ((scene.actionScore || 1) / totalActionScore) * availableHeight;
            const panelWidth = PAGE_WIDTH - 2 * gutterWidth;
            const geom = {
              x: gutterWidth,
              y: currentY,
              width: panelWidth,
              height: panelHeight,
            };
            currentY += panelHeight + gutterWidth;
            return geom;
          });
        } else if (layoutAlgorithm === 'grid') {
          const colWidth = (PAGE_WIDTH - 3 * gutterWidth) / 2;
          const numRows = Math.ceil(scenes.length / 2);
          const rowHeight =
            (PAGE_HEIGHT - (numRows + 1) * gutterWidth) / numRows;

          geometries = scenes.map((_, index) => {
            const rowIndex = Math.floor(index / 2);
            const colIndex = index % 2;
            const panelX = gutterWidth + colIndex * (colWidth + gutterWidth);
            const panelY = gutterWidth + rowIndex * (rowHeight + gutterWidth);
            return { x: panelX, y: panelY, width: colWidth, height: rowHeight };
          });
        }

        panelsForState = scenes.map((scene, index) => {
          const geom = geometries[index];
          const blob = base64ToBlob(base64Images[index]);
          return {
            id: `panel-${index}`,
            ...geom,
            imageUrl: URL.createObjectURL(blob),
            dialogue: scene.dialogue,
            sceneIndex: index,
            originalVisualPrompt: scene.visualPrompt,
          };
        });
        panelsForDb = scenes.map((scene, index) => {
          const geom = geometries[index];
          return {
            id: `panel-${index}`,
            ...geom,
            imageUrl: `data:image/jpeg;base64,${base64Images[index]}`,
            dialogue: scene.dialogue,
            sceneIndex: index,
            originalVisualPrompt: scene.visualPrompt,
          };
        });
      }

      const title = `Comic from ${originalText.substring(0, 20) || 'text'}...`;
      dispatch(
        saveComicToLibrary({
          page: { panels: panelsForDb },
          title,
          language,
        }),
      );

      return { page: { panels: panelsForState }, title };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred during comic generation.',
      );
    }
  },
);

export const regeneratePanel = createAsyncThunk<
  { panelId: string; newImageUrl: string },
  { panelId: string; newPrompt: string },
  { rejectValue: string; state: RootState }
>(
  'generation/regeneratePanel',
  async ({ panelId, newPrompt }, { getState, rejectWithValue }) => {
    const {
      comicPage,
      sceneHistory,
      sceneHistoryIndex,
      characterHistory,
      characterHistoryIndex,
    } = getState().generation;
    const { generation: generationSettings } = getState().settings;

    const panel = comicPage?.panels.find((p) => p.id === panelId);
    if (!panel) return rejectWithValue('Panel not found');

    const scene = sceneHistory[sceneHistoryIndex][panel.sceneIndex];
    if (!scene) return rejectWithValue('Original scene not found');

    const characters = characterHistory[characterHistoryIndex];
    let characterDescriptions = '';
    scene.characters.forEach((charName) => {
      const characterData = characters.find((c) => c.name === charName);
      if (characterData?.description) {
        characterDescriptions += `\n- ${charName}: ${characterData.description}`;
      }
    });

    let finalPrompt = newPrompt;
    if (characterDescriptions) {
      finalPrompt += `\n\n--- CHARACTER REFERENCE ---\n${characterDescriptions}\nEnsure the characters strictly adhere to these descriptions.`;
    }

    try {
      const base64Image = await geminiService.generatePanelImage(
        finalPrompt,
        generationSettings.imageQuality,
        generationSettings.aspectRatio,
        generationSettings.artStyle,
        generationSettings.negativePrompt,
      );
      const byteCharacters = atob(base64Image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const newImageUrl = URL.createObjectURL(blob);

      return { panelId, newImageUrl };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Image regeneration failed.',
      );
    }
  },
);

export const loadProgress = createAsyncThunk<
  SavedProgress | null,
  void,
  { rejectValue: string }
>('generation/loadProgress', async (_, { rejectWithValue }) => {
  try {
    return await dbService.loadProgress();
  } catch (err: unknown) {
    return rejectWithValue('Failed to load progress.');
  }
});

interface GenerationSliceState {
  generationState: GenerationState;
  originalText: string;
  language: 'en' | 'de';
  error: string | null;
  comicPage: ComicPageData | null;
  savedProgress: SavedProgress | null;
  panelRegenerationStatus: Record<string, 'idle' | 'loading'>;
  // Undo/Redo states
  sceneHistory: Scene[][];
  sceneHistoryIndex: number;
  characterHistory: Character[][];
  characterHistoryIndex: number;
}

const initialState: GenerationSliceState = {
  generationState: GenerationState.IDLE,
  originalText: '',
  language: 'en',
  error: null,
  comicPage: null,
  savedProgress: null,
  panelRegenerationStatus: {},
  sceneHistory: [],
  sceneHistoryIndex: -1,
  characterHistory: [],
  characterHistoryIndex: -1,
};

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    updateScene(
      state,
      action: PayloadAction<{ index: number; updatedScene: Scene }>,
    ) {
      const { index, updatedScene } = action.payload;
      const currentScenes = state.sceneHistory[state.sceneHistoryIndex] || [];
      const newScenes = [...currentScenes];
      newScenes[index] = updatedScene;
      const newHistory = state.sceneHistory.slice(
        0,
        state.sceneHistoryIndex + 1,
      );
      newHistory.push(newScenes);
      state.sceneHistory = newHistory;
      state.sceneHistoryIndex = newHistory.length - 1;
    },
    undoSceneChange(state) {
      if (state.sceneHistoryIndex > 0) state.sceneHistoryIndex--;
    },
    redoSceneChange(state) {
      if (state.sceneHistoryIndex < state.sceneHistory.length - 1)
        state.sceneHistoryIndex++;
    },
    scenesReviewed(state, action: PayloadAction<Scene[]>) {
      const allCharacters: string[] = action.payload.reduce<string[]>(
        (acc, scene) => acc.concat(scene.characters),
        [],
      );
      const characterNames: string[] = [...new Set(allCharacters)];
      const initialCharacters: Character[] = characterNames.map((name) => ({
        name,
        description: '',
        referenceImageUrl: null,
      }));
      state.characterHistory = [initialCharacters];
      state.characterHistoryIndex = 0;
      state.generationState = GenerationState.CHARACTER_DEFINITION;
    },
    updateCharacterDescription(
      state,
      action: PayloadAction<{ name: string; description: string }>,
    ) {
      const { name, description } = action.payload;
      const currentChars =
        state.characterHistory[state.characterHistoryIndex] || [];
      const newCharacters = currentChars.map((c) =>
        c.name === name ? { ...c, description } : c,
      );
      const newHistory = state.characterHistory.slice(
        0,
        state.characterHistoryIndex + 1,
      );
      newHistory.push(newCharacters);
      state.characterHistory = newHistory;
      state.characterHistoryIndex = newHistory.length - 1;
    },
    undoCharacterChange(state) {
      if (state.characterHistoryIndex > 0) state.characterHistoryIndex--;
    },
    redoCharacterChange(state) {
      if (state.characterHistoryIndex < state.characterHistory.length - 1)
        state.characterHistoryIndex++;
    },
    updatePanelDialogue(
      state,
      action: PayloadAction<{ panelId: string; newDialogue: string }>,
    ) {
      if (state.comicPage) {
        const panel = state.comicPage.panels.find(
          (p) => p.id === action.payload.panelId,
        );
        if (panel) {
          panel.dialogue = action.payload.newDialogue;
        }
      }
    },
    resetApp(state) {
      const lang = state.language;
      Object.assign(state, initialState);
      state.language = lang; // Persist language choice
      dbService.clearProgress();
    },
    resumeSession(state) {
      if (state.savedProgress) {
        state.generationState = state.savedProgress.generationState;
        state.originalText = state.savedProgress.originalText;
        state.language = state.savedProgress.language;
        state.sceneHistory = state.savedProgress.sceneHistory;
        state.sceneHistoryIndex = state.savedProgress.sceneHistoryIndex;
        state.characterHistory = state.savedProgress.characterHistory;
        state.characterHistoryIndex = state.savedProgress.characterHistoryIndex;
        state.savedProgress = null;
      }
    },
    discardSession(state) {
      state.savedProgress = null;
      dbService.clearProgress();
    },
    setComicPageFromStored(
      state,
      action: PayloadAction<{
        title: string;
        page: ComicPageData;
        language: 'en' | 'de';
      }>,
    ) {
      state.originalText = action.payload.title;
      state.comicPage = action.payload.page;
      state.language = action.payload.language;
      state.generationState = GenerationState.DONE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAnalysis.pending, (state, action) => {
        state.generationState = GenerationState.SEGMENTING_SCENES;
        state.originalText = action.meta.arg.text;
        state.language = action.meta.arg.language;
        state.error = null;
        state.comicPage = null;
        state.savedProgress = null;
        dbService.clearProgress();
      })
      .addCase(startAnalysis.fulfilled, (state, action) => {
        state.sceneHistory = [action.payload];
        state.sceneHistoryIndex = 0;
        state.generationState = GenerationState.REVIEW_SCENES;
      })
      .addCase(startAnalysis.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to analyze text.';
        state.generationState = GenerationState.ERROR;
      })
      .addCase(generateCharacterSheet.fulfilled, (state, action) => {
        const { characterName, description, imageUrl } = action.payload;
        const currentChars =
          state.characterHistory[state.characterHistoryIndex] || [];
        const newCharacters = currentChars.map((c) =>
          c.name === characterName
            ? { ...c, description, referenceImageUrl: imageUrl }
            : c,
        );
        const newHistory = state.characterHistory.slice(
          0,
          state.characterHistoryIndex + 1,
        );
        newHistory.push(newCharacters);
        state.characterHistory = newHistory;
        state.characterHistoryIndex = newHistory.length - 1;
      })
      .addCase(generateComic.pending, (state) => {
        state.generationState = GenerationState.GENERATING_IMAGES;
        dbService.clearProgress();
      })
      .addCase(generateComic.fulfilled, (state, action) => {
        state.comicPage = action.payload.page;
        state.generationState = GenerationState.DONE;
      })
      .addCase(generateComic.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to generate comic.';
        state.generationState = GenerationState.ERROR;
      })
      .addCase(regeneratePanel.pending, (state, action) => {
        state.panelRegenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(regeneratePanel.fulfilled, (state, action) => {
        const { panelId, newImageUrl } = action.payload;
        if (state.comicPage) {
          const panel = state.comicPage.panels.find((p) => p.id === panelId);
          if (panel) {
            // Revoke old blob URL to prevent memory leaks
            if (panel.imageUrl.startsWith('blob:')) {
              URL.revokeObjectURL(panel.imageUrl);
            }
            panel.imageUrl = newImageUrl;
          }
        }
        state.panelRegenerationStatus[panelId] = 'idle';
      })
      .addCase(regeneratePanel.rejected, (state, action) => {
        // You can add error handling here, e.g., show a toast notification
        console.error('Panel regeneration failed:', action.payload);
        state.panelRegenerationStatus[action.meta.arg.panelId] = 'idle';
      })
      .addCase(loadProgress.fulfilled, (state, action) => {
        state.savedProgress = action.payload;
      });
  },
});

export const {
  updateScene,
  undoSceneChange,
  redoSceneChange,
  scenesReviewed,
  updateCharacterDescription,
  undoCharacterChange,
  redoCharacterChange,
  updatePanelDialogue,
  resetApp,
  resumeSession,
  discardSession,
  setComicPageFromStored,
} = generationSlice.actions;

// Selectors
export const selectCurrentScenes = (state: RootState) =>
  state.generation.sceneHistory[state.generation.sceneHistoryIndex] || [];
export const selectCurrentCharacters = (state: RootState) =>
  state.generation.characterHistory[state.generation.characterHistoryIndex] ||
  [];

export default generationSlice.reducer;
