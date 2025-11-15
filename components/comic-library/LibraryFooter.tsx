import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import { TrashIcon } from '../Icons';

const LibraryFooter: React.FC = () => {
    const { t } = useTranslation();
    const { selectedComics, clearSelection, handleBulkDelete } = useComicLibraryContext();

    return (
        <footer className={`mt-auto pt-4 border-t border-gray-300 dark:border-gray-700 transition-all duration-300 ${selectedComics.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                    {t('comicLibrary.selectedCount', { count: selectedComics.length })}
                </p>
                <div className="flex items-center gap-4">
                    <button onClick={clearSelection} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300">
                        {t('common.none')}
                    </button>
                    <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <TrashIcon className="w-5 h-5"/>
                        {t('comicLibrary.deleteSelected')}
                    </button>
                </div>
            </div>
      </footer>
    );
};

export default LibraryFooter;
