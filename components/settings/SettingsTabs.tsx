import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { SettingsTab } from '../../hooks/useSettingsPage';
import { SparklesIcon, WrenchIcon, DatabaseIcon } from '../Icons';

const TabButton: React.FC<{ tabId: SettingsTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => {
    const { activeTab, setActiveTab } = useSettingsPageContext();
    const isActive = activeTab === tabId;

    return (
        <button
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tabId)}
            className={`relative flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 z-10 flex items-center justify-center gap-2 ${
                isActive 
                ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-md transform scale-[1.02]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};


const SettingsTabs: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-8 flex justify-center">
             <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-lg w-full">
                <TabButton tabId="generation" label={t('settingsPage.tabGeneration')} icon={<SparklesIcon className="w-4 h-4"/>} />
                <TabButton tabId="general" label={t('settingsPage.tabGeneral')} icon={<WrenchIcon className="w-4 h-4"/>} />
                <TabButton tabId="data" label={t('settingsPage.tabData')} icon={<DatabaseIcon className="w-4 h-4"/>} />
             </div>
        </div>
    );
};

export default SettingsTabs;