import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  SettingsPageProvider,
  useSettingsPageContext,
} from '../contexts/SettingsPageContext';
import SettingsTabs from './settings/SettingsTabs';
import GenerationSettings from './settings/GenerationSettings';
import GeneralSettings from './settings/GeneralSettings';
import DataSettings from './settings/DataSettings';

const SettingsPageContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const { activeTab, handleResetAllSettings } = useSettingsPageContext();
  const [confirmReset, setConfirmReset] = React.useState(false);

  React.useEffect(() => {
    if (!confirmReset) return;
    const timer = setTimeout(() => setConfirmReset(false), 2500);
    return () => clearTimeout(timer);
  }, [confirmReset]);

  const onResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    handleResetAllSettings();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('settingsPage.title')}
      </h2>

      <SettingsTabs />

      <div className="space-y-8 min-h-[400px] mt-6">
        {activeTab === 'generation' && <GenerationSettings />}
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'data' && <DataSettings />}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onResetClick}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            confirmReset
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
          }`}
        >
          {confirmReset
            ? `${t('settingsPage.clickAgainToConfirm')}`
            : t('settingsPage.resetAll')}
        </button>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
        >
          {t('settingsPage.backButton')}
        </button>
      </div>
    </div>
  );
};

const SettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <SettingsPageProvider>
      <SettingsPageContent onBack={onBack} />
    </SettingsPageProvider>
  );
};

export default SettingsPage;
