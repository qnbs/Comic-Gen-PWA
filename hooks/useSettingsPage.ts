import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setTheme } from '../features/uiSlice';
import {
  updateSettings,
  updateGenerationSettings,
} from '../features/settingsSlice';
import { clearAllData } from '../features/librarySlice';
import { discardSession } from '../features/generationSlice';
import {
  loadPresets,
  savePreset,
  deletePreset,
  applyPreset,
} from '../features/presetsSlice';
import { AppSettings, GenerationSettings, Preset } from '../types';

export type SettingsTab = 'generation' | 'general' | 'data';

// Type guard to validate the structure of imported settings
const isAppSettings = (obj: unknown): obj is Partial<AppSettings> => {
  // This is a basic check. For more robustness, you could verify
  // the presence and types of key properties.
  return typeof obj === 'object' && obj !== null;
};

export const useSettingsPage = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { theme } = useAppSelector((state) => state.ui);
  const { savedProgress } = useAppSelector((state) => state.generation);
  const presetsState = useAppSelector((state) => state.presets);

  const [activeTab, setActiveTab] = React.useState<SettingsTab>('generation');
  const [storageUsage, setStorageUsage] = React.useState({
    usage: 0,
    quota: 0,
    percent: 0,
  });

  React.useEffect(() => {
    if (presetsState.status === 'idle') {
      dispatch(loadPresets());
    }
  }, [presetsState.status, dispatch]);

  React.useEffect(() => {
    const estimateStorage = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const { usage = 0, quota = 1 } = await navigator.storage.estimate();
          setStorageUsage({
            usage,
            quota,
            percent: (usage / quota) * 100,
          });
        } catch (error) {
          console.error('Could not estimate storage:', error);
        }
      }
    };
    estimateStorage();
  }, []);

  const handleSettingChange = React.useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      dispatch(updateSettings({ [key]: value }));
    },
    [dispatch],
  );

  const handleGenerationSettingChange = React.useCallback(
    <K extends keyof GenerationSettings>(
      key: K,
      value: GenerationSettings[K],
    ) => {
      dispatch(updateGenerationSettings({ [key]: value }));
    },
    [dispatch],
  );

  const handleClearAllData = React.useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to delete all data? This cannot be undone.',
      )
    ) {
      dispatch(clearAllData());
    }
  }, [dispatch]);

  const handleClearSession = React.useCallback(() => {
    if (window.confirm('Are you sure you want to discard your current session?')) {
      dispatch(discardSession());
    }
  }, [dispatch]);

  const handleExportSettings = React.useCallback(() => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comic-gen-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settings]);

  const handleImportSettings = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error('File could not be read as text.');
          }
          const importedSettings: unknown = JSON.parse(text);

          if (isAppSettings(importedSettings)) {
            dispatch(updateSettings(importedSettings));
          } else {
            throw new Error('Imported settings file has an invalid format.');
          }
        } catch (error) {
          console.error('Failed to import settings:', error);
          alert('Failed to import settings. The file might be corrupt.');
        }
      };
      reader.readAsText(file);
    },
    [dispatch],
  );

  const handleSavePreset = React.useCallback(
    (name: string) => {
      dispatch(savePreset({ name, settings: settings.generation }));
    },
    [dispatch, settings.generation],
  );

  const handleDeletePreset = React.useCallback(
    (id: number) => {
      dispatch(deletePreset(id));
    },
    [dispatch],
  );

  const handleApplyPreset = React.useCallback(
    (preset: Preset) => {
      dispatch(applyPreset(preset));
    },
    [dispatch],
  );

  const handleThemeChange = React.useCallback(
    (newTheme: 'light' | 'dark') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch],
  );

  return {
    settings,
    theme,
    savedProgress,
    presets: presetsState.presets,
    activeTab,
    setActiveTab,
    storageUsage,
    handleSettingChange,
    handleGenerationSettingChange,
    handleThemeChange,
    handleClearAllData,
    handleClearSession,
    handleExportSettings,
    handleImportSettings,
    handleSavePreset,
    handleDeletePreset,
    handleApplyPreset,
  };
};

export type UseSettingsPageReturn = ReturnType<typeof useSettingsPage>;
