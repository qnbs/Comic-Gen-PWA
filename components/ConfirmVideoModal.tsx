import React from 'react';
import { VideoIcon, XIcon } from './Icons';
import { useFocusTrap } from '../app/hooks';
import { useTranslation } from '../hooks/useTranslation';

interface ConfirmVideoModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmVideoModal: React.FC<ConfirmVideoModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const modalRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true, onCancel);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center gap-2">
                <VideoIcon className="w-6 h-6" />
                {t('confirmVideoModal.title')}
            </h3>
            <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('common.close')}>
                <XIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('confirmVideoModal.description')}
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <li>{t('confirmVideoModal.paidFeatureNotice')}</li>
            <li>{t('confirmVideoModal.durationNotice')}</li>
            <li>{t('confirmVideoModal.billingNoticePrefix')} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</li>
        </ul>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors">
            {t('confirmVideoModal.cancelButton')}
          </button>
          <button onClick={onConfirm} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
            {t('confirmVideoModal.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfirmVideoModal);
