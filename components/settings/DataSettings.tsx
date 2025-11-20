import React, { useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { TrashIcon, DownloadIcon, UploadIcon, XIcon, ArchiveIcon } from '../Icons';
import { useFocusTrap } from '../../app/hooks';

// Self-contained modal component for this view
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: React.ReactNode;
  confirmText: string;
  confirmButtonClass?: string;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmText,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
}) => {
  const { t } = useTranslation();
  const modalRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-400 mb-6">{body}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white rounded-lg font-semibold transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataSettings: React.FC = () => {
  const { t } = useTranslation();
  const importSettingsRef = useRef<HTMLInputElement>(null);
  const importProjectsRef = useRef<HTMLInputElement>(null);
  const {
    settings,
    savedProgress: project,
    storageUsage,
    handleClearSession,
    handleClearAllData,
    handleExportSettings,
    handleImportSettings,
    handleExportAllData,
    handleImportProjects,
    handleDataSettingChange,
  } = useSettingsPageContext();

  const [isClearSessionModalOpen, setIsClearSessionModalOpen] =
    useState(false);
  const [isClearAllDataModalOpen, setIsClearAllDataModalOpen] =
    useState(false);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleClearSessionConfirm = () => {
    handleClearSession();
    setIsClearSessionModalOpen(false);
  };

  const handleClearAllDataConfirm = () => {
    handleClearAllData();
    setIsClearAllDataModalOpen(false);
  };

  return (
    <>
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
            {formatBytes(storageUsage.usage)} / {formatBytes(storageUsage.quota)}{' '}
            {t('settings.used')}
          </p>
          {storageUsage.percent > 90 && (
            <p className="text-xs text-red-500 mt-1 text-center">
              {t('settings.storageWarning')}
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
          <h4 className="font-semibold mb-2">
            {t('settingsPage.manageSettings')}
          </h4>
          <div className="flex gap-4">
            <button
              onClick={handleExportSettings}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              {t('settingsPage.exportButton')}
            </button>
            <button
              onClick={() => importSettingsRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              <UploadIcon className="w-5 h-5" />
              {t('settingsPage.importButton')}
            </button>
            <input
              type="file"
              ref={importSettingsRef}
              onChange={handleImportSettings}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300">
            {t('settingsPage.sessionManagement')}
          </h4>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="auto-save-toggle"
              className="font-medium text-yellow-700 dark:text-yellow-300"
            >
              Auto-save project
            </label>
            <input
              id="auto-save-toggle"
              type="checkbox"
              checked={settings.data.autoSave}
              onChange={(e) =>
                handleDataSettingChange('autoSave', e.target.checked)
              }
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            {t('settingsPage.clearSessionDescription')}
          </p>
          <button
            onClick={() => setIsClearSessionModalOpen(true)}
            disabled={!project}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-5 h-5" />
            {t('settingsPage.clearSession')}
          </button>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
          <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">
            {t('settingsPage.dataManagement')}
          </h4>
           <p className="text-sm text-red-600 dark:text-red-300 mb-3">
            Export all your projects and media into a single backup file, or import from a backup.
          </p>
          <div className="flex gap-4 mb-3">
            <button onClick={handleExportAllData} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                <ArchiveIcon className="w-5 h-5" />
                Export All
            </button>
            <button onClick={() => importProjectsRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                <UploadIcon className="w-5 h-5" />
                Import Backup
            </button>
             <input
              type="file"
              ref={importProjectsRef}
              onChange={handleImportProjects}
              accept=".json"
              className="hidden"
            />
          </div>
          <div className="h-px bg-red-300 dark:bg-red-700 my-4"></div>
          <p className="text-sm text-red-600 dark:text-red-300 mb-3">
            {t('settingsPage.clearDataDescription')}
          </p>
          <button
            onClick={() => setIsClearAllDataModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            {t('settingsPage.clearData')}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearSessionModalOpen}
        onClose={() => setIsClearSessionModalOpen(false)}
        onConfirm={handleClearSessionConfirm}
        title={t('settingsPage.clearSession')}
        body={t('settingsPage.clearSessionConfirmation')}
        confirmText={t('settingsPage.clearSession')}
        confirmButtonClass="bg-yellow-500 hover:bg-yellow-600"
      />
      <ConfirmModal
        isOpen={isClearAllDataModalOpen}
        onClose={() => setIsClearAllDataModalOpen(false)}
        onConfirm={handleClearAllDataConfirm}
        title={t('settingsPage.clearData')}
        body={t('settingsPage.clearDataConfirmation')}
        confirmText={t('settingsPage.clearData')}
      />
    </>
  );
};

export default DataSettings;