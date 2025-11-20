

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dbService from '../services/db';
import * as exportService from '../services/exportService';
import type { ComicProject, ComicProjectMeta } from '../types';
import { resetProject } from './projectSlice';
import { AppDispatch } from '../app/store';
import { addToast } from './uiSlice';
import { base64ToBlob } from '../services/utils';

interface ExportedProject {
  projectData: ComicProject;
  media: Record<string, { mimeType: string; data: string }>;
}

interface FullBackup {
  type: 'ComicGenPWA_Backup';
  version: number;
  projects: ComicProject[];
  media: Record<string, { mimeType: string; data: string }>;
}

const isExportedProject = (obj: unknown): obj is ExportedProject => {
  const maybeProject = obj as ExportedProject;
  return (
    typeof maybeProject === 'object' &&
    maybeProject !== null &&
    typeof maybeProject.projectData === 'object' &&
    maybeProject.projectData !== null &&
    typeof maybeProject.projectData.id === 'string' &&
    typeof maybeProject.media === 'object' &&
    maybeProject.media !== null
  );
};

const isFullBackup = (obj: unknown): obj is FullBackup => {
  const maybeBackup = obj as FullBackup;
  return (
    maybeBackup?.type === 'ComicGenPWA_Backup' &&
    Array.isArray(maybeBackup.projects)
  );
};

export const fetchProjects = createAsyncThunk<
  ComicProjectMeta[],
  void,
  { rejectValue: string }
>('library/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    return await dbService.getProjects();
  } catch (err: unknown) {
    return rejectWithValue('Failed to load projects.');
  }
});

export const importProject = createAsyncThunk<
  string,
  File,
  { dispatch: AppDispatch; rejectValue: string }
>('library/importProject', async (file, { dispatch, rejectWithValue }) => {
  try {
    const fileContent = await file.text();
    const parsedJson: unknown = JSON.parse(fileContent);

    // First, save all media blobs to the database
    const saveMedia = async (media: Record<string, { mimeType: string; data: string }>) => {
        for (const mediaId in media) {
            const mediaItem = media[mediaId];
            const blob = base64ToBlob(mediaItem.data, mediaItem.mimeType);
            await dbService.saveMediaBlob(mediaId, blob);
        }
    };
    
    if (isFullBackup(parsedJson)) {
        const { projects, media } = parsedJson;
        await saveMedia(media);

        for (const projectData of projects) {
            await dbService.saveProject(projectData);
        }

        dispatch(fetchProjects());
        return `${projects.length} projects imported from backup.`;

    } else if (isExportedProject(parsedJson)) {
        const { projectData, media } = parsedJson;
        await saveMedia(media);
        await dbService.saveProject(projectData);

        dispatch(fetchProjects());
        return `Project "${projectData.title}" imported.`;
    } else {
         throw new Error('Invalid project file format. The file is not a valid single project or full backup file.');
    }
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to import project.';
    return rejectWithValue(message);
  }
});

export const exportProjectFromJson = createAsyncThunk<
  string,
  string, // projectId
  { dispatch: AppDispatch; rejectValue: string }
>(
  'library/exportProjectFromJson',
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      const project = await dbService.getProject(projectId);
      if (!project) {
        throw new Error('Project not found for export.');
      }
      await exportService.exportProjectAsJson(project);
      return project.title;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export project.';
      return rejectWithValue(message);
    }
  },
);

export const exportAllProjects = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'library/exportAllProjects',
  async (_, { rejectWithValue }) => {
    try {
        await exportService.exportAllProjectsAsJson();
    } catch(err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Failed to export all projects.');
    }
  }
);

export const deleteProjectFromLibrary = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('library/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await dbService.deleteProject(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete project.');
  }
});

export const deleteMultipleProjectsFromLibrary = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>('library/deleteMultipleProjects', async (ids, { rejectWithValue }) => {
  try {
    await dbService.deleteMultipleProjects(ids);
    return ids;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete selected projects.');
  }
});

export const clearAllData = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('library/clearAllData', async (_, { dispatch }) => {
  await dbService.clearAllProjects();
  dispatch(resetProject());
});

interface LibraryState {
  projects: ComicProjectMeta[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LibraryState = {
  projects: [],
  status: 'idle',
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(deleteProjectFromLibrary.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload,
        );
      })
      .addCase(deleteMultipleProjectsFromLibrary.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload);
        state.projects = state.projects.filter((project) => !deletedIds.has(project.id));
      })
      .addCase(clearAllData.fulfilled, (state) => {
        state.projects = [];
        state.status = 'idle';
      });
  },
});

export default librarySlice.reducer;