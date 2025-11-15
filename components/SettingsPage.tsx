import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import { MoonIcon, SunIcon, TrashIcon } from './Icons';

type Theme = 'light' | 'dark';

interface SettingsPageProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  clearAllData: () => void;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme, clearAllData, onBack }) => {
  const { t } = useTranslation();

  const handleClearData = () => {
    if (window.confirm(t('settingsPage.clearDataConfirmation'))) {
      clearAllData();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('settingsPage.title')}
      </h2>

      <div className="space-y-8">
        {/* Appearance Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">{t('settingsPage.appearance')}</h3>
            <div className="space-y-4">
                {/* Theme Selector */}
                <div className="flex items-center justify-between">
                    <label className="font-medium">{t('settingsPage.theme')}</label>
                    <div className="flex bg-gray-200 dark:bg-gray-900 rounded-full p-1">
                        <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`} aria-label={t('settingsPage.light')}>
                            <SunIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`} aria-label={t('settingsPage.dark')}>
                            <MoonIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                    <label className="font-medium">{t('settingsPage.language')}</label>
                    <LanguageSelector />
                </div>
            </div>
        </div>

        {/* Data Management Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">{t('settingsPage.dataManagement')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settingsPage.clearDataDescription')}</p>
            <button
                onClick={handleClearData}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
                <TrashIcon className="w-5 h-5" />
                {t('settingsPage.clearData')}
            </button>
        </div>
      </div>
      <div className="mt-10 text-center">
            <button onClick={onBack} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                {t('settingsPage.backButton')}
            </button>
      </div>
    </div>
  );
};

export default SettingsPage;
