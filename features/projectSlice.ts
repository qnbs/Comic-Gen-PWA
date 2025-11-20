
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ProjectGenerationState,
  Scene,
  Character,
  ComicProject,
  Chapter,
  Pose,
  UnnormalizedComicProject,
  ChapterWithScenes,
  WorldAsset,
} from '../types';
import * as geminiService from '../services/geminiService';
import * as db from '../services/db';
import {
  generatePageFromScenes,
  regeneratePanel,
  generatePanelVideo,
  generateSpeechForPanel,
} from './pageThunks';
import {
  generateCharacterSheet,
  generateLocationSheet,
  generatePropSheet,
  generatePoseImage,
} from './worldThunks';

// Thunks for project-level async operations
export const loadProjectById = createAsyncThunk<
  ComicProject,
  string,
  { rejectValue: string }
>('project/loadById', async (projectId, { rejectWithValue }) => {
  try {
    const project = await db.getProject(projectId);
    if (!project) {
      return rejectWithValue('Project not found.');
    }
    return project;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to load project.',
    );
  }
});

export const createProject = createAsyncThunk<
  UnnormalizedComicProject,
  { text: string; title: string; language: 'en' | 'de' },
  { rejectValue: string }
>(
  'project/create',
  async ({ text, title, language }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(
        setCreationProgress({
          step: 'Structuring text into chapters...',
          progress: 10,
        }),
      );
      const chapterTexts = text
        .split(/\n\s*\n/)
        .filter((t) => t.trim().length > 10);

      dispatch(
        setCreationProgress({
          step: 'Segmenting chapters into scenes...',
          progress: 25,
        }),
      );
      const chapterPromises = chapterTexts.map(async (chapText, index): Promise<ChapterWithScenes> => {
        const sceneTexts = await geminiService.segmentTextIntoScenes(
          chapText,
          language,
        );
        if (!sceneTexts || sceneTexts.length === 0) {
          throw new Error(`Could not extract scenes from chapter ${index + 1}.`);
        }
        const scenePromises = sceneTexts.map((sceneText) =>
          geminiService.analyzeIndividualScene(sceneText, language),
        );
        const scenes = await Promise.all(scenePromises);

        const chapter: ChapterWithScenes = {
          chapterIndex: index,
          title: `Chapter ${index + 1}`,
          originalText: chapText,
          scenes: scenes,
        };
        return chapter;
      });

      const chapters = await Promise.all(chapterPromises);
      dispatch(
        setCreationProgress({
          step: 'Analyzing characters and world...',
          progress: 85,
        }),
      );
      const allCharacters = new Map<string, Character>();
      const allLocations = new Set<string>();
      const allProps = new Set<string>();
      chapters.forEach((c) =>
        c.scenes.forEach((s) => {
          s.characters.forEach((charName) => {
            if (!allCharacters.has(charName)) {
              allCharacters.set(charName, {
                name: charName,
                description: '',
                referenceImageId: null,
                poses: [],
              });
            }
          });
          s.props.forEach((propName) => allProps.add(propName));
          const potentialLocations =
            s.summary.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g) || [];
          potentialLocations.forEach((loc) => {
            if (!allCharacters.has(loc) && !allProps.has(loc)) {
              allLocations.add(loc);
            }
          });
        }),
      );

      dispatch(
        setCreationProgress({ step: 'Finalizing project...', progress: 95 }),
      );

      const newProject: UnnormalizedComicProject = {
        id: `project-${Date.now()}`,
        title,
        createdAt: new Date(),
        originalFullText: text,
        language,
        chapters,
        worldDB: {
          characters: Array.from(allCharacters.values()),
          locations: Array.from(allLocations).map((l) => ({
            name: l,
            description: '',
            referenceImageId: null,
          })),
          props: Array.from(allProps).map((p) => ({
            name: p,
            description: '',
            referenceImageId: null,
          })),
        },
        pages: [],
      };

      return newProject;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred during project creation.',
      );
    }
  },
);

type ActiveContext =
  | { type: 'overview' }
  | { type: 'chapter'; id: number }
  | { type: 'scene'; chapterId: number; sceneId: number }
  | { type: 'page'; id: number }
  | { type: 'panel'; pageId: number; panelId: string }
  | { type: 'world-characters' }
  | { type: 'world-locations' }
  | { type: 'world-props' }
  | { type: 'page-layout'; chapterId: number }
  | { type: 'comic-viewer' };

interface ProjectSliceState {
  status: ProjectGenerationState;
  project: ComicProject | null;
  entities: {
    scenes: Record<string, Scene>;
  };
  error: string | null;
  activeContext: ActiveContext;
  panelRegenerationStatus: Record<string, 'idle' | 'loading'>;
  panelVideoGenerationStatus: Record<string, 'idle' | 'loading'>;
  panelAudioGenerationStatus: Record<string, 'idle' | 'loading'>;
  creationProgress: { step: string; progress: number } | null;
}

const initialState: ProjectSliceState = {
  status: ProjectGenerationState.PROJECT_SETUP,
  project: null,
  entities: {
    scenes: {},
  },
  error: null,
  activeContext: { type: 'overview' },
  panelRegenerationStatus: {},
  panelVideoGenerationStatus: {},
  panelAudioGenerationStatus: {},
  creationProgress: null,
};

// Helper function to normalize project data
const normalizeProject = (
  state: ProjectSliceState,
  projectWithNestedScenes: UnnormalizedComicProject | ComicProject,
) => {
  const scenesEntities: Record<string, Scene> = {};
  const chaptersWithSceneIds: Chapter[] = projectWithNestedScenes.chapters.map(
    (chapter, chapterIndex) => {
      const sceneIds: string[] = [];
      // Check if scenes are objects (unnormalized)
      if (chapter.scenes.length > 0 && typeof chapter.scenes[0] !== 'string') {
        (chapter.scenes as Scene[]).forEach((scene, sceneIndex) => {
          const sceneId = `c${chapterIndex}-s${sceneIndex}`;
          scenesEntities[sceneId] = scene;
          sceneIds.push(sceneId);
        });
        return {
          ...chapter,
          scenes: sceneIds,
        };
      }
      // Already normalized (scenes are string IDs)
      return chapter as Chapter;
    },
  );

  state.project = {
    ...projectWithNestedScenes,
    chapters: chaptersWithSceneIds,
  };
  state.entities.scenes = { ...state.entities.scenes, ...scenesEntities };
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCreationProgress(
      state,
      action: PayloadAction<{ step: string; progress: number } | null>,
    ) {
      state.creationProgress = action.payload;
    },
    loadProject(state, action: PayloadAction<ComicProject>) {
      const project = action.payload;
      project.worldDB.characters.forEach((char) => {
        if (!char.poses) {
          char.poses = [];
        }
      });
      normalizeProject(state, project);
      state.status = ProjectGenerationState.DONE;
      state.activeContext = { type: 'overview' };
      state.error = null;
    },
    resetProject(state) {
      Object.assign(state, initialState);
    },
    discardSession(state) {
      Object.assign(state, initialState);
    },
    setActiveContext(state, action: PayloadAction<ActiveContext>) {
      state.activeContext = action.payload;
    },
    updatePanelDialogue(
      state,
      action: PayloadAction<{
        pageNumber: number;
        panelId: string;
        newDialogue: string;
      }>,
    ) {
      if (state.project) {
        const page = state.project.pages.find(
          (p) => p.pageNumber === action.payload.pageNumber,
        );
        if (page) {
          const panel = page.panels.find(
            (p) => p.id === action.payload.panelId,
          );
          if (panel) {
            panel.dialogue = action.payload.newDialogue;
          }
        }
      }
    },
    updatePanelLayout(
      state,
      action: PayloadAction<{
        pageNumber: number;
        panelId: string;
        layout: { x: number; y: number; width: number; height: number };
      }>,
    ) {
      if (state.project) {
        const page = state.project.pages.find(
          (p) => p.pageNumber === action.payload.pageNumber,
        );
        if (page) {
          const panel = page.panels.find(
            (p) => p.id === action.payload.panelId,
          );
          if (panel) {
            panel.x = action.payload.layout.x;
            panel.y = action.payload.layout.y;
            panel.width = action.payload.layout.width;
            panel.height = action.payload.layout.height;
          }
        }
      }
    },
    updateCharacterDescription(
      state,
      action: PayloadAction<{ name: string; description: string }>,
    ) {
      if (state.project) {
        const char = state.project.worldDB.characters.find(
          (c) => c.name === action.payload.name,
        );
        if (char) {
          char.description = action.payload.description;
        }
      }
    },
    updateLocationDescription(
      state,
      action: PayloadAction<{ name: string; description: string }>,
    ) {
      if (state.project) {
        const loc = state.project.worldDB.locations.find(
          (l) => l.name === action.payload.name,
        );
        if (loc) {
          loc.description = action.payload.description;
        }
      }
    },
    updatePropDescription(
      state,
      action: PayloadAction<{ name: string; description: string }>,
    ) {
      if (state.project) {
        const prop = state.project.worldDB.props.find(
          (p) => p.name === action.payload.name,
        );
        if (prop) {
          prop.description = action.payload.description;
        }
      }
    },
    updateScene(
      state,
      action: PayloadAction<{
        sceneId: string;
        updatedScene: Scene;
      }>,
    ) {
      if (state.entities.scenes[action.payload.sceneId]) {
        state.entities.scenes[action.payload.sceneId] =
          action.payload.updatedScene;
      }
    },
    reorderPages(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>,
    ) {
      if (state.project) {
        const [movedPage] = state.project.pages.splice(
          action.payload.fromIndex,
          1,
        );
        state.project.pages.splice(action.payload.toIndex, 0, movedPage);
        state.project.pages.forEach((page, index) => {
          page.pageNumber = index + 1;
        });
      }
    },
    addPoseToCharacter(
      state,
      action: PayloadAction<{ characterName: string }>,
    ) {
      if (state.project) {
        const character = state.project.worldDB.characters.find(
          (c) => c.name === action.payload.characterName,
        );
        if (character) {
          if (!character.poses) character.poses = [];
          const newPose: Pose = {
            id: `pose-${Date.now()}`,
            name: 'New Pose',
            description: '',
            referenceImageId: null,
          };
          character.poses.push(newPose);
        }
      }
    },
    removePoseFromCharacter(
      state,
      action: PayloadAction<{ characterName: string; poseId: string }>,
    ) {
      if (state.project) {
        const character = state.project.worldDB.characters.find(
          (c) => c.name === action.payload.characterName,
        );
        if (character && character.poses) {
          character.poses = character.poses.filter(
            (p) => p.id !== action.payload.poseId,
          );
        }
      }
    },
    updatePose(
      state,
      action: PayloadAction<{
        characterName: string;
        poseId: string;
        name: string;
        description: string;
      }>,
    ) {
      if (state.project) {
        const character = state.project.worldDB.characters.find(
          (c) => c.name === action.payload.characterName,
        );
        if (character && character.poses) {
          const pose = character.poses.find(
            (p) => p.id === action.payload.poseId,
          );
          if (pose) {
            pose.name = action.payload.name;
            pose.description = action.payload.description;
          }
        }
      }
    },
    addWorldAsset(
        state,
        action: PayloadAction<{ type: 'character' | 'location' | 'prop'; name: string }>
    ) {
        if (state.project) {
            const { type, name } = action.payload;
            const newAsset: WorldAsset | Character = {
                name,
                description: '',
                referenceImageId: null,
            };
            if (type === 'character') {
                (newAsset as Character).poses = [];
                state.project.worldDB.characters.push(newAsset as Character);
            } else if (type === 'location') {
                state.project.worldDB.locations.push(newAsset);
            } else if (type === 'prop') {
                state.project.worldDB.props.push(newAsset);
            }
        }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjectById.pending, (state) => {
        state.status = ProjectGenerationState.PROJECT_SETUP;
        state.project = null;
        state.error = null;
      })
      .addCase(loadProjectById.fulfilled, (state, action) => {
        const project = action.payload;
        project.worldDB.characters.forEach((char) => {
          if (!char.poses) {
            char.poses = [];
          }
        });
        normalizeProject(state, project);
        state.status = ProjectGenerationState.DONE;
        state.activeContext = { type: 'overview' };
        state.error = null;
      })
      .addCase(loadProjectById.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to load project.';
        state.status = ProjectGenerationState.ERROR;
      })
      // Project Lifecycle
      .addCase(createProject.pending, (state) => {
        state.status = ProjectGenerationState.GLOBAL_ANALYSIS;
        state.project = null;
        state.error = null;
        state.activeContext = { type: 'overview' };
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<UnnormalizedComicProject>) => {
        normalizeProject(state, action.payload);
        state.status = ProjectGenerationState.DONE;
        state.activeContext = { type: 'overview' };
        state.creationProgress = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to create project.';
        state.status = ProjectGenerationState.ERROR;
        state.creationProgress = null;
      })
      // Page Thunks
      .addCase(generatePageFromScenes.pending, (state) => {
        state.status = ProjectGenerationState.GENERATING_PAGES;
        state.error = null;
      })
      .addCase(generatePageFromScenes.fulfilled, (state, action) => {
        if (state.project) {
          state.project.pages.push(action.payload);
          state.activeContext = {
            type: 'page',
            id: action.payload.pageNumber,
          };
        }
        state.status = ProjectGenerationState.DONE;
      })
      .addCase(generatePageFromScenes.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to generate page.';
        state.status = ProjectGenerationState.ERROR;
      })
      .addCase(regeneratePanel.pending, (state, action) => {
        state.panelRegenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(regeneratePanel.fulfilled, (state, action) => {
        state.panelRegenerationStatus[action.payload.panelId] = 'idle';
        if (state.project) {
          for (const page of state.project.pages) {
            const panel = page.panels.find(
              (p) => p.id === action.payload.panelId,
            );
            if (panel) {
              panel.imageId = action.payload.imageId;
              panel.originalVisualPrompt = action.payload.newPrompt;
              panel.videoId = undefined;
              panel.audioId = undefined;
              break;
            }
          }
        }
      })
      .addCase(regeneratePanel.rejected, (state, action) => {
        state.panelRegenerationStatus[action.meta.arg.panelId] = 'idle';
        state.error = action.payload ?? 'Failed to regenerate panel.';
      })
      .addCase(generatePanelVideo.pending, (state, action) => {
        state.panelVideoGenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(generatePanelVideo.fulfilled, (state, action) => {
        state.panelVideoGenerationStatus[action.payload.panelId] = 'idle';
        if (state.project) {
          for (const page of state.project.pages) {
            const panel = page.panels.find(
              (p) => p.id === action.payload.panelId,
            );
            if (panel) {
              panel.videoId = action.payload.videoId;
              break;
            }
          }
        }
      })
      .addCase(generatePanelVideo.rejected, (state, action) => {
        state.panelVideoGenerationStatus[action.meta.arg.panelId] = 'idle';
        state.error = action.payload ?? 'Failed to generate video.';
      })
      .addCase(generateSpeechForPanel.pending, (state, action) => {
        state.panelAudioGenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(generateSpeechForPanel.fulfilled, (state, action) => {
        state.panelAudioGenerationStatus[action.payload.panelId] = 'idle';
        if (state.project) {
          for (const page of state.project.pages) {
            const panel = page.panels.find(
              (p) => p.id === action.payload.panelId,
            );
            if (panel) {
              panel.audioId = action.payload.audioId;
              break;
            }
          }
        }
      })
      .addCase(generateSpeechForPanel.rejected, (state, action) => {
        state.panelAudioGenerationStatus[action.meta.arg.panelId] = 'idle';
        state.error = action.payload ?? 'Failed to generate audio.';
      })
      // World Thunks
      .addCase(generateCharacterSheet.fulfilled, (state, action) => {
        if (state.project) {
          const char = state.project.worldDB.characters.find(
            (c) => c.name === action.payload.characterName,
          );
          if (char) {
            char.description = action.payload.description;
            char.referenceImageId = action.payload.imageId;
          }
        }
      })
      .addCase(generateLocationSheet.fulfilled, (state, action) => {
        if (state.project) {
          const loc = state.project.worldDB.locations.find(
            (l) => l.name === action.payload.locationName,
          );
          if (loc) {
            loc.description = action.payload.description;
            loc.referenceImageId = action.payload.imageId;
          }
        }
      })
      .addCase(generatePropSheet.fulfilled, (state, action) => {
        if (state.project) {
          const prop = state.project.worldDB.props.find(
            (p) => p.name === action.payload.propName,
          );
          if (prop) {
            prop.description = action.payload.description;
            prop.referenceImageId = action.payload.imageId;
          }
        }
      })
      .addCase(generatePoseImage.fulfilled, (state, action) => {
        if (state.project) {
          const character = state.project.worldDB.characters.find(
            (c) => c.name === action.payload.characterName,
          );
          if (character && character.poses) {
            const pose = character.poses.find(
              (p) => p.id === action.payload.poseId,
            );
            if (pose) {
              pose.referenceImageId = action.payload.imageId;
            }
          }
        }
      });
  },
});

export const {
  setCreationProgress,
  loadProject,
  resetProject,
  setActiveContext,
  updatePanelDialogue,
  updatePanelLayout,
  updateCharacterDescription,
  updateLocationDescription,
  updatePropDescription,
  updateScene,
  reorderPages,
  discardSession,
  addPoseToCharacter,
  removePoseFromCharacter,
  updatePose,
  addWorldAsset,
} = projectSlice.actions;

export default projectSlice.reducer;
