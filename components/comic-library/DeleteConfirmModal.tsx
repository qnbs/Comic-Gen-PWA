import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';

const DeleteConfirmModal: React.FC = () => {
    const { t } = useTranslation();
    const { projectToDelete, isBulkDelete, selectedProjects, confirmDelete, cancelDelete } = useComicLibraryContext();

    if (!projectToDelete) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{t('comicLibrary.deleteConfirmTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isBulkDelete 
                        ? t('comicLibrary.deleteMultipleConfirmBody', { count: selectedProjects.length }) 
                        : t('comicLibrary.deleteConfirmBody', { title: projectToDelete.title })}
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={cancelDelete} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors">
                        {t('comicLibrary.cancel')}
                    </button>
                    <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                        {t('comicLibrary.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;