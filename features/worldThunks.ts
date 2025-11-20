import { createAsyncThunk } from '@reduxjs/toolkit';
import * as geminiService from '../services/geminiService';
import * as db from '../services/db';
import { RootState } from '../app/store';
import { base64ToBlob } from '../services/utils';

// Thunks for async world-building operations
async function generateAndSaveAsset(
  generateFn: () => Promise<{ description: string; imageUrl: string }>,
) {
  const { description, imageUrl: dataUrl } = await generateFn();
  const base64 = dataUrl.split(',')[1];
  const blob = base64ToBlob(base64);
  const imageId = `media-${Date.now()}-${Math.random()}`;
  await db.saveMediaBlob(imageId, blob);
  return { description, imageId };
}

export const generateCharacterSheet = createAsyncThunk<
  { characterName: string; description: string; imageId: string },
  { characterName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'world/generateCharacterSheet',
  async ({ characterName, context }, { getState, rejectWithValue }) => {
    const language = getState().project.present.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageId } = await generateAndSaveAsset(() =>
        geminiService.generateCharacterSheet(characterName, context, language),
      );
      return { characterName, description, imageId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'Failed to generate character sheet.',
      );
    }
  },
);

export const generateLocationSheet = createAsyncThunk<
  { locationName: string; description: string; imageId: string },
  { locationName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'world/generateLocationSheet',
  async ({ locationName, context }, { getState, rejectWithValue }) => {
    const language = getState().project.present.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageId } = await generateAndSaveAsset(() =>
        geminiService.generateLocationSheet(locationName, context, language),
      );
      return { locationName, description, imageId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'Failed to generate location sheet.',
      );
    }
  },
);

export const generatePropSheet = createAsyncThunk<
  { propName: string; description: string; imageId: string },
  { propName: string; context: string },
  { rejectValue: string; state: RootState }
>(
  'world/generatePropSheet',
  async ({ propName, context }, { getState, rejectWithValue }) => {
    const language = getState().project.present.project?.language;
    if (!language) {
      return rejectWithValue('Project language not set.');
    }
    try {
      const { description, imageId } = await generateAndSaveAsset(() =>
        geminiService.generatePropSheet(propName, context, language),
      );
      return { propName, description, imageId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to generate prop sheet.',
      );
    }
  },
);

export const generatePoseImage = createAsyncThunk<
  { characterName: string; poseId: string; imageId: string },
  { characterName: string; poseId: string; poseDescription: string },
  { rejectValue: string; state: RootState }
>(
  'world/generatePoseImage',
  async (
    { characterName, poseId, poseDescription },
    { getState, rejectWithValue },
  ) => {
    const { project } = getState().project.present;
    if (!project) return rejectWithValue('No project loaded.');

    const character = project.worldDB.characters.find(
      (c) => c.name === characterName,
    );
    if (!character) return rejectWithValue('Character not found.');
    if (!character.description)
      return rejectWithValue('Character base description is missing.');

    try {
      const { imageUrl } = await geminiService.generatePoseImage(
        characterName,
        character.description,
        poseDescription,
      );
      const base64 = imageUrl.split(',')[1];
      const blob = base64ToBlob(base64);
      const imageId = `media-${Date.now()}-${Math.random()}`;
      await db.saveMediaBlob(imageId, blob);
      return { characterName, poseId, imageId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to generate pose image.',
      );
    }
  },
);