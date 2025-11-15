import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { SettingsTab } from '../../hooks/useSettingsPage';

const TabButton: React.FC<{ tabId: SettingsTab; label: string }> = ({ tabId, label }) => {
    const { activeTab, setActiveTab } = useSettingsPageContext();
    return (
        <button
            role="tab"
            aria-selected={activeTab === tabId}
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            activeTab === tabId
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );
};


const SettingsTabs: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-6 flex justify-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <TabButton tabId="generation" label={t('settingsPage.tabGeneration')} />
            <TabButton tabId="general" label={t('settingsPage.tabGeneral')} />
            <TabButton tabId="data" label={t('settingsPage.tabData')} />
        </div>
    );
};

export default SettingsTabs;
