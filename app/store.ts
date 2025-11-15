import { configureStore } from '@reduxjs/toolkit';
import generationReducer from '../features/generationSlice';
import uiReducer from '../features/uiSlice';
import settingsReducer from '../features/settingsSlice';
import libraryReducer from '../features/librarySlice';
import presetsReducer from '../features/presetsSlice';
import { autoSaveMiddleware } from './autoSaveMiddleware';

export const store = configureStore({
  reducer: {
    generation: generationReducer,
    ui: uiReducer,
    settings: settingsReducer,
    library: libraryReducer,
    presets: presetsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autoSaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
