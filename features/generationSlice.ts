import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  hierarchy,
  treemap,
  treemapSquarify,
  treemapSliceDice,
  treemapBinary,
  HierarchyRectangularNode,
  HierarchyNode,
} from 'd3-hierarchy';
import {
  ProjectGenerationState,
  Scene,
  Character,
  ComicBookPage,
  PanelData,
  ComicProject,
  Chapter,
  WorldAsset,
  Pose,
} from '../types';
import * as geminiService from '../services/geminiService';
import * as dbService from '../services/db';
import { RootState, AppDispatch } from '../app/store';
import { addToast } from './uiSlice';
import { base64ToBlob } from '../services/utils';
import { decode } from '../services/audioUtils';

// Helper to build context for image generation prompts
const buildPromptContext = (project: ComicProject): string => {
  let context = '';
  if (project.worldDB.characters.length > 0) {
    context += 'CHARACTER REFERENCE:\n';
    project.worldDB.characters.forEach(c => {
      if (c.description) {
        context += `- ${c.name}: ${c.description}\n`;
      }
      if (c.poses && c.poses.length > 0) {
        context += `\nPOSES FOR ${c.name.toUpperCase()}:\n`;
        c.poses.forEach(p => {
          if (p.name && p.description) {
            context += `- ${p.name}: ${p.description}\n`;
          }
        });
      }
    });
  }
   if (project.worldDB.locations.length > 0) {
    context += 'LOCATION REFERENCE:\n';
    project.worldDB.locations.forEach(l => {
      if (l.description) {
        context += `- ${l.name}: ${l.description}\n`;
      }
    });
  }
  if (project.worldDB.props.length > 0) {
    context += 'PROP REFERENCE:\n';
    project.worldDB.props.forEach(p => {
      if (p.description) {
        context += `- ${p.name}: ${p.description}\n`;
      }
    });
  }
  return context ? context + 'Ensure the visual depictions strictly adhere to these references.\n---\n' : '';
};


// Thunks for async operations
export const createProject = createAsyncThunk<
  ComicProject,
  { text: string; title: string; language: 'en' | 'de' },
  { rejectValue: string }
>(
  'generation/createProject',
  async ({ text, title, language }, { rejectWithValue }) => {
    try {
      const chapterTexts = text.split(/\n\s*\n/).filter(t => t.trim().length > 10);

      const chapterPromises = chapterTexts.map(async (chapText, index) => {
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
          
          const chapter: Chapter = {
              chapterIndex: index,
              title: `Chapter ${index + 1}`,
              originalText: chapText,
              scenes,
          };
          return chapter;
      });
      
      const chapters = await Promise.all(chapterPromises);

      const allCharacters = new Map<string, Character>();
      const allLocations = new Set<string>();
      const allProps = new Set<string>();
      chapters.forEach(c => c.scenes.forEach(s => {
        s.characters.forEach(charName => {
          if (!allCharacters.has(charName)) {
            allCharacters.set(charName, { name: charName, description: '', referenceImageUrl: null, poses: [] });
          }
        });
        s.props.forEach(propName => allProps.add(propName));
        // A simple heuristic for locations: look for capitalized words that aren't characters
        const potentialLocations = s.summary.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g) || [];
        potentialLocations.forEach(loc => {
            if (!allCharacters.has(loc) && !allProps.has(loc)) {
                allLocations.add(loc);
            }
        });
      }));

      const newProject: ComicProject = {
        id: `project-${Date.now()}`,
        title,
        createdAt: new Date(),
        originalFullText: text,
        language,
        chapters,
        worldDB: { 
            characters: Array.from(allCharacters.values()), 
            locations: Array.from(allLocations).map(l => ({ name: l, description: '', referenceImageUrl: null })),
            props: Array.from(allProps).map(p => ({ name: p, description: '', referenceImageUrl: null }))
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

export const generatePageFromScenes = createAsyncThunk<
  ComicBookPage,
  { sceneIndices: number[]; chapterIndex: number },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'generation/generatePageFromScenes',
  async ({ sceneIndices, chapterIndex }, { getState, rejectWithValue }) => {
    const { generation, settings } = getState();
    const project = generation.project;
    if (!project) return rejectWithValue('No active project.');
    const chapter = project.chapters[chapterIndex];
    if (!chapter) return rejectWithValue('Chapter not found.');

    const scenesToProcess = sceneIndices.map(i => chapter.scenes[i]);
    if (scenesToProcess.some(s => !s)) return rejectWithValue('Invalid scene selection.');

    try {
       const promptContext = buildPromptContext(project);

      const imagePromises = scenesToProcess.map(scene => {
          const fullPrompt = promptContext + scene.visualPrompt;
          return geminiService.generatePanelImage(
            fullPrompt,
            settings.generation.imageQuality,
            settings.generation.aspectRatio,
            settings.generation.artStyle,
            settings.generation.negativePrompt,
          );
      });
      
      const base64Images = await Promise.all(imagePromises);
      const imageUrls = base64Images.map(base64 => URL.createObjectURL(base64ToBlob(base64)));

      // Define an interface for the data structure used by D3 hierarchy.
      // This improves type safety and removes the need for `any`.
      interface LayoutDataNode {
        name: string;
        value: number;
        scene: Scene;
        imageUrl: string;
        originalPrompt: string;
      }
      
      // Define an interface for a D3 node that has been processed by .sum()
      interface HierarchyNodeWithValue<Datum> extends HierarchyNode<Datum> {
        value: number;
      }

      const layoutData = {
        name: 'root',
        children: scenesToProcess.map((scene, i): LayoutDataNode => ({
          name: `scene-${i}`,
          value: Math.max(1, scene.actionScore), // Ensure value is positive
          scene: scene,
          imageUrl: imageUrls[i],
          originalPrompt: scene.visualPrompt,
        })),
      };

      const root = hierarchy(layoutData)
        .sum((d: LayoutDataNode) => d.value)
        .sort((a, b) => (b as HierarchyNodeWithValue<unknown>).value - (a as HierarchyNodeWithValue<unknown>).value);

      const treemapLayout = treemap().size([1100, 1600]).padding(settings.generation.gutterWidth);
      
      switch (settings.generation.layoutAlgorithm) {
        case 'strip': treemapLayout.tile(treemapSliceDice); break;
        case 'binary': treemapLayout.tile(treemapBinary); break;
        case 'squarified': default: treemapLayout.tile(treemapSquarify); break;
      }
      
      treemapLayout(root);

      const panels: PanelData[] = (root.leaves() as HierarchyRectangularNode<{ scene: Scene, imageUrl: string, originalPrompt: string }>[]).map((node, i) => ({
        id: `panel-${Date.now()}-${i}`,
        x: node.x0,
        y: node.y0,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        imageUrl: node.data.imageUrl,
        dialogue: node.data.scene.dialogue,
        sceneIndex: chapter.scenes.indexOf(node.data.scene),
        originalVisualPrompt: node.data.originalPrompt,
      }));

      const newPage: ComicBookPage = {
        pageNumber: (project.pages.length || 0) + 1,
        panels,
      };

      return newPage;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate page.');
    }
  },
);

export const regeneratePanel = createAsyncThunk<
  { panelId: string; imageUrl: string; newPrompt: string },
  { panelId: string; newPrompt: string },
  { rejectValue: string; state: RootState }
>(
  'generation/regeneratePanel',
  async ({ panelId, newPrompt }, { getState, rejectWithValue }) => {
    const { generation, settings } = getState();
    if (!generation.project) {
        return rejectWithValue('No project loaded.');
    }
    
    try {
      const promptContext = buildPromptContext(generation.project);
      const fullPrompt = promptContext + newPrompt;

      const base64Image = await geminiService.generatePanelImage(
        fullPrompt,
        settings.generation.imageQuality,
        settings.generation.aspectRatio,
        settings.generation.artStyle,
        settings.generation.negativePrompt,
      );
      const blob = base64ToBlob(base64Image);
      const imageUrl = URL.createObjectURL(blob);
      return { panelId, imageUrl, newPrompt };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to regenerate panel.');
    }
  }
);

export const generatePanelVideo = createAsyncThunk<
  { panelId: string, videoUrl: string },
  { panelId: string, prompt: string },
  { rejectValue: string; state: RootState, dispatch: AppDispatch }
>(
  'generation/generatePanelVideo',
  async ({ panelId, prompt }, { getState, rejectWithValue, dispatch }) => {
    const { settings } = getState();
    try {
      let operation = await geminiService.generatePanelVideo(prompt, settings.generation.aspectRatio);
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await geminiService.pollVideoOperation(operation);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error("Video generation succeeded but no download link was provided.");
      }
      
      // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        throw new Error(`Failed to download video file: ${response.statusText}`);
      }
      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      
      dispatch(addToast({ message: 'Video panel generated!', type: 'success' }));
      return { panelId, videoUrl };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video panel.';
      dispatch(addToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const generateSpeechForPanel = createAsyncThunk<
  { panelId: string, audioUrl: string },
  { panelId: string, text: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generateSpeechForPanel',
  async ({ panelId, text }, { getState, rejectWithValue }) => {
      const { settings } = getState();
      const voiceName = settings.speechBubbles.ttsVoice;
      try {
          const base64Audio = await geminiService.generateSpeech(text, voiceName);
          const audioBytes = decode(base64Audio);
          const audioBlob = new Blob([audioBytes], { type: 'audio/pcm;rate=24000' });
          const audioUrl = URL.createObjectURL(audioBlob);
          return { panelId, audioUrl };
      } catch (err: unknown) {
          return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate speech.');
      }
  }
);

export const generateCharacterSheet = createAsyncThunk<
  { characterName: string; description: string; imageUrl: string },
  { characterName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generateCharacterSheet',
  async ({ characterName, context }, { getState, rejectWithValue }) => {
    const language = getState().generation.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageUrl } = await geminiService.generateCharacterSheet(characterName, context, language);
      return { characterName, description, imageUrl };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate character sheet.');
    }
  }
);

export const generateLocationSheet = createAsyncThunk<
  { locationName: string; description: string; imageUrl: string },
  { locationName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generateLocationSheet',
  async ({ locationName, context }, { getState, rejectWithValue }) => {
    const language = getState().generation.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageUrl } = await geminiService.generateLocationSheet(locationName, context, language);
      return { locationName, description, imageUrl };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate location sheet.');
    }
  }
);

export const generatePropSheet = createAsyncThunk<
  { propName: string; description: string; imageUrl: string },
  { propName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generatePropSheet',
  async ({ propName, context }, { getState, rejectWithValue }) => {
    const language = getState().generation.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageUrl } = await geminiService.generatePropSheet(propName, context, language);
      return { propName, description, imageUrl };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate prop sheet.');
    }
  }
);

export const generatePoseImage = createAsyncThunk<
  { characterName: string; poseId: string; imageUrl: string },
  { characterName: string; poseId: string; poseDescription: string },
  { rejectValue: string; state: RootState }
>(
  'generation/generatePoseImage',
  async ({ characterName, poseId, poseDescription }, { getState, rejectWithValue }) => {
    const { project } = getState().generation;
    if (!project) return rejectWithValue('No project loaded.');
    
    const character = project.worldDB.characters.find(c => c.name === characterName);
    if (!character) return rejectWithValue('Character not found.');
    if (!character.description) return rejectWithValue('Character base description is missing.');

    const language = project.language;

    try {
      const { imageUrl } = await geminiService.generatePoseImage(
        characterName,
        character.description,
        poseDescription,
        language
      );
      return { characterName, poseId, imageUrl };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to generate pose image.');
    }
  }
);

// Add stub thunk for generateComic to prevent compile errors.
export const generateComic = createAsyncThunk(
  'generation/generateComic',
  () => { console.warn("generateComic is not implemented in the new project structure."); }
);

interface GenerationSliceState {
  generationState: ProjectGenerationState;
  project: ComicProject | null;
  error: string | null;
  activeChapterIndex: number | null;
  panelRegenerationStatus: Record<string, 'idle' | 'loading'>;
  panelVideoGenerationStatus: Record<string, 'idle' | 'loading'>;
  panelAudioGenerationStatus: Record<string, 'idle' | 'loading'>;
}

const initialState: GenerationSliceState = {
  generationState: ProjectGenerationState.PROJECT_SETUP,
  project: null,
  error: null,
  activeChapterIndex: null,
  panelRegenerationStatus: {},
  panelVideoGenerationStatus: {},
  panelAudioGenerationStatus: {},
};

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    loadProject(state, action: PayloadAction<ComicProject>) {
      const project = action.payload;
      // Ensure backward compatibility for projects saved without the poses array
      project.worldDB.characters.forEach(char => {
        if (!char.poses) {
          char.poses = [];
        }
      });
      state.project = project;
      state.generationState = ProjectGenerationState.DONE;
      state.activeChapterIndex = null;
      state.error = null;
    },
    resetApp(state) {
      Object.assign(state, initialState);
    },
    discardSession(state) {
      Object.assign(state, initialState);
    },
    setGenerationStep(state, action: PayloadAction<ProjectGenerationState>) {
        state.generationState = action.payload;
        if (action.payload === ProjectGenerationState.PROJECT_SETUP) {
            state.project = null;
        }
    },
    setActiveChapter(state, action: PayloadAction<number | null>) {
        state.activeChapterIndex = action.payload;
        if (action.payload !== null) {
            state.generationState = ProjectGenerationState.CHAPTER_REVIEW;
        } else if (state.project) {
            state.generationState = ProjectGenerationState.DONE;
        }
    },
    updatePanelDialogue(state, action: PayloadAction<{ pageNumber: number; panelId: string; newDialogue: string }>) {
        if (state.project) {
            const page = state.project.pages.find(p => p.pageNumber === action.payload.pageNumber);
            if (page) {
                const panel = page.panels.find(p => p.id === action.payload.panelId);
                if (panel) {
                    panel.dialogue = action.payload.newDialogue;
                }
            }
        }
    },
    updatePanelLayout(state, action: PayloadAction<{ pageNumber: number; panelId: string; layout: { x: number; y: number; width: number; height: number } }>) {
        if (state.project) {
            const page = state.project.pages.find(p => p.pageNumber === action.payload.pageNumber);
            if (page) {
                const panel = page.panels.find(p => p.id === action.payload.panelId);
                if (panel) {
                    panel.x = action.payload.layout.x;
                    panel.y = action.payload.layout.y;
                    panel.width = action.payload.layout.width;
                    panel.height = action.payload.layout.height;
                }
            }
        }
    },
    updateCharacterDescription(state, action: PayloadAction<{ name: string; description: string }>) {
        if (state.project) {
            const char = state.project.worldDB.characters.find(c => c.name === action.payload.name);
            if (char) {
                char.description = action.payload.description;
            }
        }
    },
    updateLocationDescription(state, action: PayloadAction<{ name: string; description: string }>) {
        if (state.project) {
            const loc = state.project.worldDB.locations.find(l => l.name === action.payload.name);
            if (loc) {
                loc.description = action.payload.description;
            }
        }
    },
    updatePropDescription(state, action: PayloadAction<{ name: string; description: string }>) {
        if (state.project) {
            const prop = state.project.worldDB.props.find(p => p.name === action.payload.name);
            if (prop) {
                prop.description = action.payload.description;
            }
        }
    },
    updateScene(state, action: PayloadAction<{ chapterIndex: number; sceneIndex: number; updatedScene: Scene }>) {
      if (state.project) {
        const chapter = state.project.chapters[action.payload.chapterIndex];
        if (chapter) {
          chapter.scenes[action.payload.sceneIndex] = action.payload.updatedScene;
        }
      }
    },
    reorderPages(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      if (state.project) {
        const [movedPage] = state.project.pages.splice(action.payload.fromIndex, 1);
        state.project.pages.splice(action.payload.toIndex, 0, movedPage);
        // Renumber pages after reordering to maintain sequence
        state.project.pages.forEach((page, index) => {
            page.pageNumber = index + 1;
        });
      }
    },
    addPoseToCharacter(state, action: PayloadAction<{ characterName: string }>) {
      if (state.project) {
          const character = state.project.worldDB.characters.find(c => c.name === action.payload.characterName);
          if (character) {
              if (!character.poses) character.poses = [];
              const newPose: Pose = {
                  id: `pose-${Date.now()}`,
                  name: 'New Pose',
                  description: '',
                  referenceImageUrl: null,
              };
              character.poses.push(newPose);
          }
      }
    },
    removePoseFromCharacter(state, action: PayloadAction<{ characterName: string; poseId: string }>) {
        if (state.project) {
            const character = state.project.worldDB.characters.find(c => c.name === action.payload.characterName);
            if (character && character.poses) {
                character.poses = character.poses.filter(p => p.id !== action.payload.poseId);
            }
        }
    },
    updatePose(state, action: PayloadAction<{ characterName: string; poseId: string; name: string; description: string }>) {
        if (state.project) {
            const character = state.project.worldDB.characters.find(c => c.name === action.payload.characterName);
            if (character && character.poses) {
                const pose = character.poses.find(p => p.id === action.payload.poseId);
                if (pose) {
                    pose.name = action.payload.name;
                    pose.description = action.payload.description;
                }
            }
        }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.generationState = ProjectGenerationState.GLOBAL_ANALYSIS;
        state.project = null;
        state.error = null;
        state.activeChapterIndex = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.project = action.payload;
        state.generationState = ProjectGenerationState.CHAPTER_REVIEW;
        state.activeChapterIndex = action.payload.chapters.length > 0 ? 0 : null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to create project.';
        state.generationState = ProjectGenerationState.ERROR;
      })
       .addCase(generatePageFromScenes.pending, (state) => {
        state.generationState = ProjectGenerationState.GENERATING_PAGES;
        state.error = null;
      })
      .addCase(generatePageFromScenes.fulfilled, (state, action) => {
        if (state.project) {
            state.project.pages.push(action.payload);
        }
        state.generationState = ProjectGenerationState.DONE;
      })
      .addCase(generatePageFromScenes.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to generate page.';
        state.generationState = ProjectGenerationState.ERROR;
      })
      .addCase(regeneratePanel.pending, (state, action) => {
          state.panelRegenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(regeneratePanel.fulfilled, (state, action) => {
          state.panelRegenerationStatus[action.payload.panelId] = 'idle';
          if (state.project) {
              for (const page of state.project.pages) {
                  const panel = page.panels.find(p => p.id === action.payload.panelId);
                  if (panel) {
                      if (panel.imageUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(panel.imageUrl);
                      }
                      panel.imageUrl = action.payload.imageUrl;
                      panel.originalVisualPrompt = action.payload.newPrompt;
                      // Clear video/audio as they are now outdated
                      panel.videoUrl = undefined;
                      panel.isVideo = false;
                      panel.audioUrl = undefined;
                      break;
                  }
              }
          }
      })
      .addCase(regeneratePanel.rejected, (state, action) => {
          state.panelRegenerationStatus[action.meta.arg.panelId] = 'idle';
          state.error = action.payload ?? 'Failed to regenerate panel.';
      })
      .addCase(generateCharacterSheet.fulfilled, (state, action) => {
          if (state.project) {
              const char = state.project.worldDB.characters.find(c => c.name === action.payload.characterName);
              if (char) {
                  char.description = action.payload.description;
                  char.referenceImageUrl = action.payload.imageUrl;
              }
          }
      })
      .addCase(generateLocationSheet.fulfilled, (state, action) => {
          if (state.project) {
              const loc = state.project.worldDB.locations.find(l => l.name === action.payload.locationName);
              if (loc) {
                  loc.description = action.payload.description;
                  loc.referenceImageUrl = action.payload.imageUrl;
              }
          }
      })
      .addCase(generatePropSheet.fulfilled, (state, action) => {
          if (state.project) {
              const prop = state.project.worldDB.props.find(p => p.name === action.payload.propName);
              if (prop) {
                  prop.description = action.payload.description;
                  prop.referenceImageUrl = action.payload.imageUrl;
              }
          }
      })
      .addCase(generatePoseImage.fulfilled, (state, action) => {
        if (state.project) {
            const character = state.project.worldDB.characters.find(c => c.name === action.payload.characterName);
            if (character && character.poses) {
                const pose = character.poses.find(p => p.id === action.payload.poseId);
                if (pose) {
                    pose.referenceImageUrl = action.payload.imageUrl;
                }
            }
        }
      })
      .addCase(generatePanelVideo.pending, (state, action) => {
          state.panelVideoGenerationStatus[action.meta.arg.panelId] = 'loading';
      })
      .addCase(generatePanelVideo.fulfilled, (state, action) => {
          state.panelVideoGenerationStatus[action.payload.panelId] = 'idle';
          if (state.project) {
              for (const page of state.project.pages) {
                  const panel = page.panels.find(p => p.id === action.payload.panelId);
                  if (panel) {
                      panel.videoUrl = action.payload.videoUrl;
                      panel.isVideo = true;
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
                  const panel = page.panels.find(p => p.id === action.payload.panelId);
                  if (panel) {
                      panel.audioUrl = action.payload.audioUrl;
                      break;
                  }
              }
          }
      })
      .addCase(generateSpeechForPanel.rejected, (state, action) => {
          state.panelAudioGenerationStatus[action.meta.arg.panelId] = 'idle';
          state.error = action.payload ?? 'Failed to generate audio.';
      });
  },
});

export const {
  loadProject,
  resetApp,
  setActiveChapter,
  setGenerationStep,
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
} = generationSlice.actions;

export default generationSlice.reducer;