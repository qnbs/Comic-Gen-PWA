
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import {
  LayoutAlgorithm,
  AspectRatio,
  AdvancedGenerationSettings,
  VideoSettings,
  ImageModel,
} from '../../types';
import PresetsManager from './PresetsManager';
import { TranslationKeys } from '../../services/translations';
import { SparklesIcon } from '../Icons';

const GenerationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, handleGenerationSettingChange } = useSettingsPageContext();
  const { generation } = settings;

  const handleAdvancedChange = <K extends keyof AdvancedGenerationSettings>(
    key: K,
    value: AdvancedGenerationSettings[K],
  ) => {
    handleGenerationSettingChange('advanced', {
      ...generation.advanced,
      [key]: value,
    });
  };

  const handleVideoChange = <K extends keyof VideoSettings>(
    key: K,
    value: VideoSettings[K],
  ) => {
    handleGenerationSettingChange('video', { ...generation.video, [key]: value });
  };
  
  const artStylePresets = ['default', 'manga', 'noir', 'watercolor', 'cyberpunk', 'cinematic', 'art nouveau', '3d render'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div className="space-y-6">
        <PresetsManager />
        
        {/* New AI Model Selection */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <label className="block text-indigo-900 dark:text-indigo-100 font-bold mb-2 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {t('settings.aiModelEngine')}
            </label>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
                {t('settings.aiModelDesc')}
            </p>
            <select
                value={generation.imageModel}
                onChange={(e) => handleGenerationSettingChange('imageModel', e.target.value as ImageModel)}
                className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            >
                <option value="gemini-3-pro">{t('settings.modelGemini3')}</option>
                <option value="nano-banana">{t('settings.modelNano')}</option>
                <option value="imagen-4">{t('settings.modelImagen4')}</option>
            </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            {t('settings.artStyle')}
          </label>
           <input
            list="art-style-presets"
            value={generation.artStyle}
            onChange={(e) =>
              handleGenerationSettingChange('artStyle', e.target.value)
            }
            placeholder="e.g., 90s comic, synthwave"
            className="w-full bg-gray-50 dark:bg-gray-900/50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all rounded-xl px-4 py-2 outline-none"
          />
          <datalist id="art-style-presets">
            {artStylePresets.map(style => <option key={style} value={style} />)}
          </datalist>
        </div>
        <div>
          <label
            htmlFor="negative-prompt"
            className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
          >
            {t('settings.negativePrompt')}
          </label>
          <input
            id="negative-prompt"
            type="text"
            value={generation.negativePrompt}
            onChange={(e) =>
              handleGenerationSettingChange('negativePrompt', e.target.value)
            }
            placeholder={t('settings.negativePromptPlaceholder')}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all rounded-xl px-4 py-2 outline-none"
          />
        </div>
        <details className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-transparent">
          <summary className="font-semibold cursor-pointer text-gray-700 dark:text-gray-300">{t('settings.advancedOptions')}</summary>
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Seed</label>
                <input type="number" placeholder="Random" value={generation.advanced.seed ?? ''} onChange={e => handleAdvancedChange('seed', e.target.value === '' ? null : parseInt(e.target.value))} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Temperature: {generation.advanced.temperature.toFixed(2)}</label>
                <input type="range" min="0" max="1" step="0.05" value={generation.advanced.temperature} onChange={e => handleAdvancedChange('temperature', parseFloat(e.target.value))} className="w-full accent-indigo-600" aria-label="Temperature" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Top-P: {generation.advanced.topP.toFixed(2)}</label>
                <input type="range" min="0" max="1" step="0.01" value={generation.advanced.topP} onChange={e => handleAdvancedChange('topP', parseFloat(e.target.value))} className="w-full accent-indigo-600" aria-label="Top-P" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Top-K: {generation.advanced.topK}</label>
                <input type="range" min="1" max="100" step="1" value={generation.advanced.topK} onChange={e => handleAdvancedChange('topK', parseInt(e.target.value))} className="w-full accent-indigo-600" aria-label="Top-K" />
             </div>
          </div>
        </details>
      </div>

      <div className="space-y-6">
         <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            {t('settings.pageComposition')}
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.panelDensity')}</span>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                {(['low', 'medium', 'high'] as const).map((d) => (
                  <button key={d} onClick={() => handleGenerationSettingChange('panelDensity', d)} className={`w-16 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${generation.panelDensity === d ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.panelLayout')}</span>
              <select value={generation.layoutAlgorithm} onChange={(e) => handleGenerationSettingChange('layoutAlgorithm', e.target.value as LayoutAlgorithm)} className="w-32 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 text-sm text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                {(['squarified', 'strip', 'binary', 'grid', 'column'] as LayoutAlgorithm[]).map(l => <option key={l} value={l}>{t(`settings.layout${l.charAt(0).toUpperCase() + l.slice(1)}` as TranslationKeys)}</option>)}
              </select>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.aspectRatio')}</span>
              <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                {(['1:1', '4:3', '3:4', '16:9', '9:16'] as AspectRatio[]).map(r => <button key={r} onClick={() => handleGenerationSettingChange('aspectRatio', r)} className={`px-1 py-1.5 text-[10px] font-medium rounded-md transition-colors ${generation.aspectRatio === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{r}</button>)}
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            {t('settings.videoGeneration')}
          </label>
           <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.resolution')}</span>
               <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                {(['720p', '1080p'] as const).map(r => <button key={r} onClick={() => handleVideoChange('resolution', r)} className={`w-16 py-1.5 text-xs font-medium rounded-md transition-colors ${generation.video.resolution === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{r}</button>)}
              </div>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.motionLevel')}</span>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                {(['low', 'medium', 'high'] as const).map(m => <button key={m} onClick={() => handleVideoChange('motion', m)} className={`w-16 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${generation.video.motion === m ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{m}</button>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationSettings;
