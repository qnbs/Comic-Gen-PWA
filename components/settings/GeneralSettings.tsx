import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import LanguageSelector from '../LanguageSelector';
import { MoonIcon, SunIcon } from '../Icons';
import { SpeechBubbleStyle } from '../../types';
import { TranslationKeys } from '../../services/translations';

const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const {
        settings,
        theme,
        handleSettingChange,
        handleThemeChange,
    } = useSettingsPageContext();

    const handleBubbleChange = <K extends keyof typeof settings.speechBubbles>(key: K, value: (typeof settings.speechBubbles)[K]) => {
        handleSettingChange('speechBubbles', { ...settings.speechBubbles, [key]: value });
    };
    
    const ttsVoices = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'];

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <label className="font-medium text-gray-700 dark:text-gray-300">{t('settingsPage.theme')}</label>
                <div className="flex bg-gray-200 dark:bg-gray-900 rounded-full p-1">
                    <button onClick={() => handleThemeChange('light')} className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`} aria-label={t('settingsPage.light')}><SunIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleThemeChange('dark')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`} aria-label={t('settingsPage.dark')}><MoonIcon className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <label className="font-medium text-gray-700 dark:text-gray-300">{t('settingsPage.language')}</label>
                <LanguageSelector />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Speech Bubbles</h4>
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="show-bubbles-toggle" className="font-medium text-gray-700 dark:text-gray-300">{t('settings.showSpeechBubbles')}</label>
                    <input id="show-bubbles-toggle" type="checkbox" checked={settings.showSpeechBubbles} onChange={e => handleSettingChange('showSpeechBubbles', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">{t('settings.bubbleStyle')}</label>
                        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                            {(['rounded', 'sharp', 'cloud'] as SpeechBubbleStyle[]).map(s => (
                                <button key={s} onClick={() => handleBubbleChange('style', s)} className={`px-2 py-1 text-xs rounded transition-colors capitalize ${settings.speechBubbles.style === s ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>{t(`settings.style${s.charAt(0).toUpperCase() + s.slice(1)}` as TranslationKeys)}</button>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">{t('settings.bubbleFont')}</label>
                        <select value={settings.speechBubbles.fontFamily} onChange={e => handleBubbleChange('fontFamily', e.target.value)} className="w-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option style={{fontFamily: "'Bangers', cursive"}} value="'Bangers', cursive">{t('settings.fontBangers')}</option>
                            <option style={{fontFamily: "Arial, sans-serif"}} value="Arial, sans-serif">Arial</option>
                            <option style={{fontFamily: "'Times New Roman', serif"}} value="'Times New Roman', serif">Times New Roman</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">TTS Voice</label>
                        <select value={settings.speechBubbles.ttsVoice} onChange={e => handleBubbleChange('ttsVoice', e.target.value)} className="w-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                            {ttsVoices.map(voice => (
                                <option key={voice} value={voice}>{voice}</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">Background Color</label>
                        <input type="color" value={settings.speechBubbles.backgroundColor} onChange={e => handleBubbleChange('backgroundColor', e.target.value)} className="w-10 h-8 p-0 border-none rounded-md cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">Text Color</label>
                        <input type="color" value={settings.speechBubbles.textColor} onChange={e => handleBubbleChange('textColor', e.target.value)} className="w-10 h-8 p-0 border-none rounded-md cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">Opacity</label>
                        <div className="flex items-center gap-3">
                            <input type="range" min="0" max="1" step="0.05" value={settings.speechBubbles.opacity} onChange={e => handleBubbleChange('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-sm font-mono p-1 bg-gray-100 dark:bg-gray-900 rounded-md w-12 text-center">{settings.speechBubbles.opacity.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
