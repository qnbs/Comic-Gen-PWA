import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { XIcon, TrashIcon } from '../Icons';
import { useFocusTrap } from '../../app/hooks';

interface ConfirmDeleteBookModalProps {
    bookTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteBookModal: React.FC<ConfirmDeleteBookModalProps> = ({ bookTitle, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    const modalRef = React.useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, true, onCancel);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrashIcon className="w-6 h-6 text-red-500" />
                        {t('importer.confirmDeleteBookTitle')}
                    </h3>
                    <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('importer.confirmDeleteBookBody', { title: bookTitle })}
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteBookModal;
