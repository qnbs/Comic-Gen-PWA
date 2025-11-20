import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import LanguageSelector from '../LanguageSelector';
import { MoonIcon, SunIcon } from '../Icons';
import { SpeechBubbleStyle, SpeechBubblePlacement } from '../../types';
import { TranslationKeys } from '../../services/translations';

const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    theme,
    handleThemeChange,
    handleSpeechBubbleSettingChange,
    handleShowSpeechBubblesChange,
    handleAccessibilitySettingChange,
  } = useSettingsPageContext();

  const { showSpeechBubbles, speechBubbles, accessibility } = settings;

  const ttsVoices = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'];

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Appearance
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {t('settingsPage.theme')}
            </label>
            <div className="flex bg-gray-200 dark:bg-gray-900 rounded-full p-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label={t('settingsPage.light')}
              >
                <SunIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label={t('settingsPage.dark')}
              >
                <MoonIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {t('settingsPage.language')}
            </label>
            <LanguageSelector />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Speech Bubbles
        </h4>
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="show-bubbles-toggle"
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            {t('settings.showSpeechBubbles')}
          </label>
          <input
            id="show-bubbles-toggle"
            type="checkbox"
            checked={showSpeechBubbles}
            onChange={(e) => handleShowSpeechBubblesChange(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="bubble-style"
              className="font-medium text-gray-700 dark:text-gray-300 text-sm"
            >
              {t('settings.bubbleStyle')}
            </label>
            <select
              id="bubble-style"
              value={speechBubbles.style}
              onChange={(e) =>
                handleSpeechBubbleSettingChange(
                  'style',
                  e.target.value as SpeechBubbleStyle,
                )
              }
              className="w-32 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm"
            >
              <option value="rounded">{t('settings.styleRounded')}</option>
              <option value="sharp">{t('settings.styleSharp')}</option>
              <option value="cloud">{t('settings.styleCloud')}</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="bubble-font-family"
              className="font-medium text-gray-700 dark:text-gray-300 text-sm"
            >
              {t('settings.bubbleFont')}
            </label>
            <select
              id="bubble-font-family"
              value={speechBubbles.fontFamily}
              onChange={(e) =>
                handleSpeechBubbleSettingChange('fontFamily', e.target.value)
              }
              className="w-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm"
            >
              <option value="'Bangers', cursive">
                {t('settings.fontBangers')}
              </option>
              <option value="'Comic Neue', cursive">
                {t('settings.fontComicNeue')}
              </option>
              <option value="'Architects Daughter', cursive">
                {t('settings.fontArchitectsDaughter')}
              </option>
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t('settings.bubbleFontSize')}: {speechBubbles.fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={speechBubbles.fontSize}
              onChange={(e) =>
                handleSpeechBubbleSettingChange('fontSize', parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t('settings.bubbleColors')}
            </label>
            <div className="flex gap-2">
              <input type="color" title="Background Color" value={speechBubbles.backgroundColor} onChange={(e) => handleSpeechBubbleSettingChange('backgroundColor', e.target.value)} className="w-9 h-8 p-0 border-none rounded-md cursor-pointer" />
              <input type="color" title="Text Color" value={speechBubbles.textColor} onChange={(e) => handleSpeechBubbleSettingChange('textColor', e.target.value)} className="w-9 h-8 p-0 border-none rounded-md cursor-pointer" />
              <input type="color" title="Stroke Color" value={speechBubbles.strokeColor} onChange={(e) => handleSpeechBubbleSettingChange('strokeColor', e.target.value)} className="w-9 h-8 p-0 border-none rounded-md cursor-pointer" />
            </div>
          </div>
           <div>
            <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t('settings.bubbleOpacity')}: {Math.round(speechBubbles.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={speechBubbles.opacity}
              onChange={(e) =>
                handleSpeechBubbleSettingChange('opacity', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="tts-voice"
              className="font-medium text-gray-700 dark:text-gray-300 text-sm"
            >
              {t('settings.ttsVoice')}
            </label>
            <select
              id="tts-voice"
              value={speechBubbles.ttsVoice}
              onChange={(e) =>
                handleSpeechBubbleSettingChange('ttsVoice', e.target.value)
              }
              className="w-32 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm"
            >
              {ttsVoices.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              Placement Algorithm
            </label>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
              {(['physics', 'static'] as SpeechBubblePlacement[]).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    handleSpeechBubbleSettingChange('placementAlgorithm', p)
                  }
                  className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
                    speechBubbles.placementAlgorithm === p
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Accessibility
        </h4>
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="reduce-motion-toggle"
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            Reduce Motion
          </label>
          <input
            id="reduce-motion-toggle"
            type="checkbox"
            checked={accessibility.reduceMotion}
            onChange={(e) =>
              handleAccessibilitySettingChange('reduceMotion', e.target.checked)
            }
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;