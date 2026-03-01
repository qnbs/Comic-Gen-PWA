import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToast, setTheme } from '../features/uiSlice';
import {
  setSettings,
  updateShowSpeechBubbles,
  updateSpeechBubbleSettings,
  updateGenerationSettings,
  updateAccessibilitySettings,
  updateDataSettings,
} from '../features/settingsSlice';
import { clearAllData, exportAllProjects, importProject } from '../features/librarySlice';
import { discardSession } from '../features/projectSlice';
import {
  loadPresets,
  savePreset,
  deletePreset,
  applyPreset,
} from '../features/presetsSlice';
import {
  AppSettings,
  GenerationSettings,
  SpeechBubbleSettings,
  AccessibilitySettings,
  DataSettings,
  Preset,
} from '../types';
import {
  saveGeminiApiKeyEncrypted,
  clearGeminiApiKeyEncrypted,
  hasGeminiApiKeyEncrypted,
} from '../services/secureKeyStore';

export type SettingsTab = 'generation' | 'general' | 'data';

// Type guard to validate the structure of imported settings
const isAppSettings = (obj: unknown): obj is Partial<AppSettings> => {
  return typeof obj === 'object' && obj !== null;
};

export const useSettingsPage = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { theme } = useAppSelector((state) => state.ui);
  const { project } = useAppSelector((state) => state.project.present);
  const presetsState = useAppSelector((state) => state.presets);

  const [activeTab, setActiveTab] = React.useState<SettingsTab>('generation');
  const [storageUsage, setStorageUsage] = React.useState({
    usage: 0,
    quota: 0,
    percent: 0,
  });
  const [geminiApiKeyInput, setGeminiApiKeyInput] = React.useState('');
  const [hasGeminiApiKey, setHasGeminiApiKey] = React.useState(false);

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
        } catch (error: unknown) {
          console.error('Could not estimate storage:', error);
        }
      }
    };
    estimateStorage();
  }, []);

  React.useEffect(() => {
    hasGeminiApiKeyEncrypted()
      .then(setHasGeminiApiKey)
      .catch(() => setHasGeminiApiKey(false));
  }, []);

  const handleShowSpeechBubblesChange = React.useCallback(
    (value: boolean) => {
      dispatch(updateShowSpeechBubbles(value));
    },
    [dispatch],
  );

  const handleSpeechBubbleSettingChange = React.useCallback(
    <K extends keyof SpeechBubbleSettings>(
      key: K,
      value: SpeechBubbleSettings[K],
    ) => {
      dispatch(updateSpeechBubbleSettings({ [key]: value }));
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

  const handleAccessibilitySettingChange = React.useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K],
    ) => {
      dispatch(updateAccessibilitySettings({ [key]: value }));
    },
    [dispatch],
  );

  const handleDataSettingChange = React.useCallback(
    <K extends keyof DataSettings>(key: K, value: DataSettings[K]) => {
      dispatch(updateDataSettings({ [key]: value }));
    },
    [dispatch],
  );

  const handleClearAllData = React.useCallback(() => {
    dispatch(clearAllData());
  }, [dispatch]);

  const handleClearSession = React.useCallback(() => {
    dispatch(discardSession());
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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error('File could not be read as text.');
          }
          const importedSettings: unknown = JSON.parse(text);

          if (isAppSettings(importedSettings)) {
            dispatch(setSettings(importedSettings));
          } else {
            throw new Error('Imported settings file has an invalid format.');
          }
        } catch (error: unknown) {
          console.error('Failed to import settings:', error);
          alert('Failed to import settings. The file might be corrupt.');
        }
      };
      reader.readAsText(file);
    },
    [dispatch],
  );

   const handleExportAllData = React.useCallback(() => {
    dispatch(addToast({ message: 'Preparing full backup...', type: 'info' }));
    dispatch(exportAllProjects()).unwrap()
        .then(() => {
            dispatch(addToast({ message: 'Full backup exported.', type: 'success'}));
        })
        .catch((error: unknown) => {
            dispatch(addToast({ message: String(error), type: 'error'}));
        });
  }, [dispatch]);

  const handleImportProjects = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    dispatch(importProject(file)).unwrap()
        .then((message) => {
            dispatch(addToast({ message, type: 'success' }));
        })
        .catch((error: unknown) => {
            dispatch(addToast({ message: String(error), type: 'error' }));
        });
    // Reset file input to allow re-importing the same file
    event.target.value = '';
  }, [dispatch]);


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

  const handleSaveGeminiApiKey = React.useCallback(async () => {
    const trimmed = geminiApiKeyInput.trim();
    if (!trimmed || trimmed.length < 20) {
      dispatch(
        addToast({ message: 'Please provide a valid Gemini API key.', type: 'error' }),
      );
      return;
    }

    try {
      await saveGeminiApiKeyEncrypted(trimmed);
      setGeminiApiKeyInput('');
      setHasGeminiApiKey(true);
      dispatch(
        addToast({ message: 'Gemini API key saved securely.', type: 'success' }),
      );
    } catch (error: unknown) {
      dispatch(
        addToast({ message: String(error), type: 'error' }),
      );
    }
  }, [dispatch, geminiApiKeyInput]);

  const handleRemoveGeminiApiKey = React.useCallback(async () => {
    try {
      await clearGeminiApiKeyEncrypted();
      setHasGeminiApiKey(false);
      setGeminiApiKeyInput('');
      dispatch(
        addToast({ message: 'Gemini API key removed.', type: 'info' }),
      );
    } catch (error: unknown) {
      dispatch(
        addToast({ message: String(error), type: 'error' }),
      );
    }
  }, [dispatch]);

  return {
    settings,
    theme,
    savedProgress: project,
    presets: presetsState.presets,
    activeTab,
    setActiveTab,
    storageUsage,
    handleShowSpeechBubblesChange,
    handleSpeechBubbleSettingChange,
    handleGenerationSettingChange,
    handleAccessibilitySettingChange,
    handleDataSettingChange,
    handleThemeChange,
    handleClearAllData,
    handleClearSession,
    handleExportSettings,
    handleImportSettings,
    handleExportAllData,
    handleImportProjects,
    handleSavePreset,
    handleDeletePreset,
    handleApplyPreset,
    geminiApiKeyInput,
    setGeminiApiKeyInput,
    hasGeminiApiKey,
    handleSaveGeminiApiKey,
    handleRemoveGeminiApiKey,
  };
};

export type UseSettingsPageReturn = ReturnType<typeof useSettingsPage>;