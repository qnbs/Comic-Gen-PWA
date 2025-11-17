import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { saveProject } from '../services/db';
import { ProjectGenerationState } from '../types';
import { RootState } from './store';

// Debounce function to prevent saving on every keystroke
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
) => {
  let timeout: number;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), delay);
  };
};

// Rewrote performSave to work with the new project-based state.
const performSave = (state: RootState) => {
  const { generation } = state;
  const { generationState, project } = generation;

  // Only save if a project exists and is in a state where user is making edits.
  if (
    project &&
    (generationState === ProjectGenerationState.CHAPTER_REVIEW ||
      generationState === ProjectGenerationState.WORLD_BUILDING)
  ) {
    saveProject(project);
  }
};

const debouncedSave = debounce(performSave, 1000);

// --- Persistence for Settings and UI ---
const SETTINGS_STORAGE_KEY = 'comicGenSettings';
const APP_THEME_KEY = 'comicGenTheme';

const persistState = (action: AnyAction, state: RootState) => {
  // Persist settings slice on any change within it
  if (action.type.startsWith('settings/')) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
    } catch (e) {
      console.error('Could not save settings to local storage', e);
    }
  }

  // Persist UI theme when it's changed
  if (action.type === 'ui/setTheme') {
    try {
      localStorage.setItem(APP_THEME_KEY, state.ui.theme);
    } catch (e) {
      console.error('Could not save theme to local storage', e);
    }
  }
};

export const autoSaveMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    if (typeof action !== 'object' || !action.type) {
      return result;
    }

    const state = store.getState();

    // Handle session auto-save
    if (action.type.startsWith('generation/') && !action.type.endsWith('/pending')) {
      debouncedSave(state);
    }

    // Handle settings/UI persistence
    persistState(action, state);

    return result;
  };
