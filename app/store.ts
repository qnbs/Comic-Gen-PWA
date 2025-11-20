import { configureStore } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';
import projectReducer from '../features/projectSlice';
import uiReducer from '../features/uiSlice';
import settingsReducer from '../features/settingsSlice';
import libraryReducer from '../features/librarySlice';
import presetsReducer from '../features/presetsSlice';
import libraryBrowserReducer from '../features/gutenbergSlice';
import { autoSaveMiddleware } from './autoSaveMiddleware';

export const store = configureStore({
  reducer: {
    project: undoable(projectReducer, {
      // Exclude pending thunks and other non-user actions from history
      filter: excludeAction([
        'project/create/pending',
        'page/generateFromScenes/pending',
        'page/regeneratePanel/pending',
        'page/generateVideo/pending',
        'page/generateSpeech/pending',
        'world/generateCharacterSheet/pending',
        'world/generateLocationSheet/pending',
        'world/generatePropSheet/pending',
        'world/generatePoseImage/pending',
      ]),
      limit: 30, // Limit history to prevent excessive memory usage
    }),
    ui: uiReducer,
    settings: settingsReducer,
    library: libraryReducer,
    presets: presetsReducer,
    libraryBrowser: libraryBrowserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-undo state is not serializable.
      serializableCheck: false,
    }).concat(autoSaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
