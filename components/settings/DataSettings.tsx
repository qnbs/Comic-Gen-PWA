import React, { useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { TrashIcon, DownloadIcon, UploadIcon } from '../Icons';

const DataSettings: React.FC = () => {
    const { t } = useTranslation();
    const importSettingsRef = useRef<HTMLInputElement>(null);
    const {
        savedProgress,
        storageUsage,
        handleClearSession,
        handleClearAllData,
        handleExportSettings,
        handleImportSettings
    } = useSettingsPageContext();

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
                <h4 className="font-semibold mb-2">{t('settings.localStorage')}</h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${storageUsage.percent}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {formatBytes(storageUsage.usage)} / {formatBytes(storageUsage.quota)} {t('settings.used')}
                </p>
                {storageUsage.percent > 90 && <p className="text-xs text-red-500 mt-1 text-center">{t('settings.storageWarning')}</p>}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
                <h4 className="font-semibold mb-2">{t('settingsPage.manageSettings')}</h4>
                <div className="flex gap-4">
                    <button onClick={handleExportSettings} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"><DownloadIcon className="w-5 h-5" />{t('settingsPage.exportButton')}</button>
                    <button onClick={() => importSettingsRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"><UploadIcon className="w-5 h-5" />{t('settingsPage.importButton')}</button>
                    <input type="file" ref={importSettingsRef} onChange={handleImportSettings} accept=".json" className="hidden" />
                </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300">{t('settingsPage.sessionManagement')}</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">{t('settingsPage.clearSessionDescription')}</p>
                <button onClick={handleClearSession} disabled={!savedProgress} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5" />{t('settingsPage.clearSession')}</button>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">{t('settingsPage.dataManagement')}</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">{t('settingsPage.clearDataDescription')}</p>
                <button onClick={handleClearAllData} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"><TrashIcon className="w-5 h-5" />{t('settingsPage.clearData')}</button>
            </div>
        </div>
    );
};

export default DataSettings;
