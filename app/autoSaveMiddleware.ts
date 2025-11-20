import { Middleware, UnknownAction, Dispatch } from '@reduxjs/toolkit';
import { saveProject } from '../services/db';
import { ProjectGenerationState } from '../types';
import { RootState } from './store';
import { setSaveStatus } from '../features/uiSlice';

// Type guard to check if an action has a 'type' property
function isAction(action: unknown): action is { type: string } {
  return typeof action === 'object' && action !== null && 'type' in action && typeof (action as { type: unknown }).type === 'string';
}

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

const performSave = async (state: RootState, dispatch: Dispatch<UnknownAction>) => {
  const { status, project } = state.project.present;

  if (
    project &&
    (status === ProjectGenerationState.CHAPTER_REVIEW ||
      status === ProjectGenerationState.WORLD_BUILDING ||
      status === ProjectGenerationState.PAGE_LAYOUT ||
      status === ProjectGenerationState.VIEWING_PAGES ||
      status === ProjectGenerationState.DONE)
  ) {
    dispatch(setSaveStatus('saving'));
    try {
      await saveProject(project);
      dispatch(setSaveStatus('saved'));
    } catch (e: unknown) {
      console.error('Auto-save failed:', e);
      dispatch(setSaveStatus('error'));
    }
  }
};

const debouncedSave = debounce(performSave, 1500);

const SETTINGS_STORAGE_KEY = 'comicGenSettings';
const APP_THEME_KEY = 'comicGenTheme';

const persistState = (action: { type: string }, state: RootState) => {
  if (action.type.startsWith('settings/')) {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(state.settings),
      );
    } catch (e: unknown) {
      console.error('Could not save settings to local storage', e);
    }
  }

  if (action.type === 'ui/setTheme') {
    try {
      localStorage.setItem(APP_THEME_KEY, state.ui.theme);
    } catch (e: unknown) {
      console.error('Could not save theme to local storage', e);
    }
  }
};

export const autoSaveMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action: unknown) => {
    const result = next(action);

    if (!isAction(action)) {
      return result;
    }

    const state = store.getState();

    if (state.settings.data.autoSave) {
      if (
        (action.type.startsWith('project/') ||
          action.type.startsWith('world/') ||
          action.type.startsWith('page/')) &&
        !action.type.endsWith('/pending') &&
        action.type !== 'project/create/fulfilled' // Don't auto-save on initial creation
      ) {
        debouncedSave(state, store.dispatch as Dispatch<UnknownAction>);
      }
      
      // Explicitly save after project creation is fulfilled
      if (action.type === 'project/create/fulfilled') {
          performSave(state, store.dispatch as Dispatch<UnknownAction>);
      }
    }

    persistState(action, state);

    return result;
  };