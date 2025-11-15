import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { ArtStyle, LayoutAlgorithm, ImageQuality, AspectRatio } from '../../types';
import PresetsManager from './PresetsManager';
import { TranslationKeys } from '../../services/translations';

const GenerationSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, handleGenerationSettingChange } = useSettingsPageContext();
    const { generation } = settings;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            <div className="space-y-6">
                <PresetsManager />
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.artStyle')}</label>
                    <select value={generation.artStyle} onChange={e => handleGenerationSettingChange('artStyle', e.target.value as ArtStyle)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="default">{t('settings.styleDefault')}</option>
                        <option value="manga">{t('settings.styleManga')}</option>
                        <option value="noir">{t('settings.styleNoir')}</option>
                        <option value="watercolor">{t('settings.styleWatercolor')}</option>
                        <option value="cyberpunk">{t('settings.styleCyberpunk')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.imageQuality')}</label>
                    <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                        {(['low', 'medium', 'high'] as ImageQuality[]).map(q => (
                            <button key={q} onClick={() => handleGenerationSettingChange('imageQuality', q)} className={`w-1/3 py-1 text-sm rounded transition-colors capitalize ${generation.imageQuality === q ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>{t(`settings.quality${q.charAt(0).toUpperCase() + q.slice(1)}` as TranslationKeys)}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="negative-prompt" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.negativePrompt')}</label>
                    <input id="negative-prompt" type="text" value={generation.negativePrompt} onChange={e => handleGenerationSettingChange('negativePrompt', e.target.value)} placeholder={t('settings.negativePromptPlaceholder')} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                    <p className={`text-xs text-right mt-1 ${generation.negativePrompt.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>{generation.negativePrompt.length} / 250</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.panelLayout')}</label>
                    <div className="grid grid-cols-3 sm:flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                        {(['squarified', 'strip', 'binary', 'grid', 'column'] as LayoutAlgorithm[]).map(l => (
                            <button key={l} onClick={() => handleGenerationSettingChange('layoutAlgorithm', l)} className={`flex-1 min-w-[60px] py-1 text-xs rounded transition-colors capitalize ${generation.layoutAlgorithm === l ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>{t(`settings.layout${l.charAt(0).toUpperCase() + l.slice(1)}` as TranslationKeys)}</button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.aspectRatio')}</label>
                    <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                        {(['1:1', '4:3', '3:4', '16:9', '9:16'] as AspectRatio[]).map(r => (
                            <button key={r} onClick={() => handleGenerationSettingChange('aspectRatio', r)} className={`py-1 text-xs rounded transition-colors ${generation.aspectRatio === r ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>{r}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.gutterWidth')}</label>
                    <div className="flex items-center gap-3">
                        <input type="range" min="0" max="50" step="1" value={generation.gutterWidth} onChange={e => handleGenerationSettingChange('gutterWidth', parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <span className="text-sm font-mono p-1 bg-gray-100 dark:bg-gray-900 rounded-md w-12 text-center">{generation.gutterWidth}px</span>
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('settings.pageBorder')}</label>
                    <div className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                        <div className="flex items-center gap-2">
                            <input id="border-toggle" type="checkbox" checked={generation.pageBorder.enabled} onChange={e => handleGenerationSettingChange('pageBorder', { ...generation.pageBorder, enabled: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="border-toggle" className="text-sm">{t('common.enabled')}</label>
                        </div>
                        <input type="color" value={generation.pageBorder.color} onChange={e => handleGenerationSettingChange('pageBorder', { ...generation.pageBorder, color: e.target.value })} disabled={!generation.pageBorder.enabled} className="w-10 h-8 p-0 border-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerationSettings;