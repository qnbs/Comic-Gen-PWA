import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  hierarchy,
  treemap,
  treemapSquarify,
  treemapSliceDice,
  treemapBinary,
  HierarchyRectangularNode,
  HierarchyNode,
} from 'd3-hierarchy';
import { Scene, ComicBookPage, PanelData, ComicProject } from '../types';
import * as geminiService from '../services/geminiService';
import * as db from '../services/db';
import { RootState, AppDispatch } from '../app/store';
import { addToast } from './uiSlice';
import { base64ToBlob } from '../services/utils';
import { decode } from '../services/audioUtils';

// Helper to build context for image generation prompts
const buildPromptContext = (project: ComicProject): string => {
  let context = '';
  if (project.worldDB.characters.length > 0) {
    context += 'CHARACTER REFERENCE:\n';
    project.worldDB.characters.forEach((c) => {
      if (c.description) {
        context += `- ${c.name}: ${c.description}\n`;
      }
      if (c.poses && c.poses.length > 0) {
        context += `\nPOSES FOR ${c.name.toUpperCase()}:\n`;
        c.poses.forEach((p) => {
          if (p.name && p.description) {
            context += `- ${p.name}: ${p.description}\n`;
          }
        });
      }
    });
  }
  if (project.worldDB.locations.length > 0) {
    context += 'LOCATION REFERENCE:\n';
    project.worldDB.locations.forEach((l) => {
      if (l.description) {
        context += `- ${l.name}: ${l.description}\n`;
      }
    });
  }
  if (project.worldDB.props.length > 0) {
    context += 'PROP REFERENCE:\n';
    project.worldDB.props.forEach((p) => {
      if (p.description) {
        context += `- ${p.name}: ${p.description}\n`;
      }
    });
  }
  return context
    ? context +
        'Ensure the visual depictions strictly adhere to these references.\n---\n'
    : '';
};

export const generatePageFromScenes = createAsyncThunk<
  ComicBookPage,
  { sceneIndices: number[]; chapterIndex: number },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'page/generateFromScenes',
  async ({ sceneIndices, chapterIndex }, { getState, rejectWithValue }) => {
    const { project: projectState, settings } = getState();
    const { project, entities } = projectState.present;
    if (!project) return rejectWithValue('No active project.');
    
    const chapter = project.chapters[chapterIndex];
    if (!chapter) return rejectWithValue('Chapter not found.');

    const sceneIdsToProcess = sceneIndices.map((i) => chapter.scenes[i]);
    const scenesToProcess = sceneIdsToProcess.map(id => entities.scenes[id]);

    if (scenesToProcess.some((s) => !s))
      return rejectWithValue('Invalid scene selection.');

    try {
      const promptContext = buildPromptContext(project);

      const imagePromises = scenesToProcess.map(async (scene) => {
        const fullPrompt = promptContext + scene.visualPrompt;
        const base64Image = await geminiService.generatePanelImage(
          fullPrompt,
          settings.generation.imageQuality,
          settings.generation.aspectRatio,
          settings.generation.artStyle,
          settings.generation.negativePrompt,
          settings.generation.advanced,
          settings.generation.imageModel, // Pass the selected model
        );
        const blob = base64ToBlob(base64Image);
        const imageId = `media-${Date.now()}-${Math.random()}`;
        await db.saveMediaBlob(imageId, blob);
        return imageId;
      });

      const imageIds = await Promise.all(imagePromises);

      interface LayoutDataNode {
        name: string;
        value: number;
        scene: Scene;
        imageId: string;
        originalPrompt: string;
        sceneId: string;
      }

      interface HierarchyNodeWithValue<Datum> extends HierarchyNode<Datum> {
        value: number;
      }

      const layoutData = {
        name: 'root',
        children: scenesToProcess.map(
          (scene, i): LayoutDataNode => ({
            name: `scene-${i}`,
            value: Math.max(1, scene.actionScore),
            scene: scene,
            imageId: imageIds[i],
            originalPrompt: scene.visualPrompt,
            sceneId: sceneIdsToProcess[i],
          }),
        ),
      };

      const root = hierarchy(layoutData)
        .sum((d: LayoutDataNode) => d.value)
        .sort(
          (a, b) =>
            (b as HierarchyNodeWithValue<unknown>).value -
            (a as HierarchyNodeWithValue<unknown>).value,
        );

      const treemapLayout = treemap()
        .size([1100, 1600])
        .padding(settings.generation.gutterWidth);

      switch (settings.generation.layoutAlgorithm) {
        case 'strip':
          treemapLayout.tile(treemapSliceDice);
          break;
        case 'binary':
          treemapLayout.tile(treemapBinary);
          break;
        case 'squarified':
        default:
          treemapLayout.tile(treemapSquarify);
          break;
      }

      treemapLayout(root);

      const panels: PanelData[] = (
        root.leaves() as HierarchyRectangularNode<{
          scene: Scene;
          imageId: string;
          originalPrompt: string;
          sceneId: string;
        }>[]
      ).map((node, i) => ({
          id: `panel-${Date.now()}-${i}`,
          x: node.x0,
          y: node.y0,
          width: node.x1 - node.x0,
          height: node.y1 - node.y0,
          imageId: node.data.imageId,
          dialogue: node.data.scene.dialogue,
          sceneId: node.data.sceneId,
          originalVisualPrompt: node.data.originalPrompt,
        }));

      const newPage: ComicBookPage = {
        pageNumber: (project.pages.length || 0) + 1,
        panels,
      };

      return newPage;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to generate page.',
      );
    }
  },
);

export const regeneratePanel = createAsyncThunk<
  { panelId: string; imageId: string; newPrompt: string },
  { panelId: string; newPrompt: string },
  { rejectValue: string; state: RootState }
>(
  'page/regeneratePanel',
  async ({ panelId, newPrompt }, { getState, rejectWithValue }) => {
    const { project: projectState, settings } = getState();
    const project = projectState.present.project;
    if (!project) {
      return rejectWithValue('No project loaded.');
    }
    try {
      const promptContext = buildPromptContext(project);
      const fullPrompt = promptContext + newPrompt;

      const base64Image = await geminiService.generatePanelImage(
        fullPrompt,
        settings.generation.imageQuality,
        settings.generation.aspectRatio,
        settings.generation.artStyle,
        settings.generation.negativePrompt,
        settings.generation.advanced,
        settings.generation.imageModel, // Pass the selected model
      );
      const blob = base64ToBlob(base64Image);
      const imageId = `media-${Date.now()}-${Math.random()}`;
      await db.saveMediaBlob(imageId, blob);
      return { panelId, imageId, newPrompt };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to regenerate panel.',
      );
    }
  },
);

export const generatePanelVideo = createAsyncThunk<
  { panelId: string; videoId: string },
  { panelId: string; prompt: string },
  { rejectValue: string; state: RootState; dispatch: AppDispatch }
>(
  'page/generateVideo',
  async ({ panelId, prompt }, { getState, rejectWithValue, dispatch }) => {
    const { settings } = getState();
    try {
      let operation = await geminiService.generatePanelVideo(
        prompt,
        settings.generation.aspectRatio,
        settings.generation.video,
      );

      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await geminiService.pollVideoOperation(operation);
      }

      const downloadLink =
        operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error(
          'Video generation succeeded but no download link was provided.',
        );
      }

      const authenticatedUrl = await geminiService.getAuthenticatedUrl(downloadLink);
      const response = await fetch(authenticatedUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download video file: ${response.statusText}`,
        );
      }
      const videoBlob = await response.blob();
      const videoId = `media-${Date.now()}-${Math.random()}`;
      await db.saveMediaBlob(videoId, videoBlob);

      return { panelId, videoId };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate video panel.';
      return rejectWithValue(errorMessage);
    }
  },
);

export const generateSpeechForPanel = createAsyncThunk<
  { panelId: string; audioId: string },
  { panelId: string; text: string },
  { rejectValue: string; state: RootState }
>('page/generateSpeech', async ({ panelId, text }, { getState, rejectWithValue }) => {
  const { settings } = getState();
  const voiceName = settings.speechBubbles.ttsVoice;
  try {
    const base64Audio = await geminiService.generateSpeech(text, voiceName);
    const audioBytes = decode(base64Audio);
    const audioBlob = new Blob([audioBytes], { type: 'audio/pcm;rate=24000' });
    const audioId = `media-${Date.now()}-${Math.random()}`;
    await db.saveMediaBlob(audioId, audioBlob);
    return { panelId, audioId };
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to generate speech.',
    );
  }
});