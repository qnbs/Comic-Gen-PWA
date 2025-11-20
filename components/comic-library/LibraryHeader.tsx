import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import { SearchIcon, SortAscendingIcon, UploadIcon } from '../Icons';
import { SortOption } from './types';
import { useAppDispatch } from '../../app/hooks';
import { importProject } from '../../features/librarySlice';
import { addToast } from '../../features/uiSlice';

const LibraryHeader: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { searchQuery, setSearchQuery, sortOrder, setSortOrder } =
    useComicLibraryContext();
  const importFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(importProject(file))
        .unwrap()
        .then((projectTitle) => {
          dispatch(addToast({ message: `Project "${projectTitle}" imported successfully!`, type: 'success'}));
        })
        .catch((error: unknown) => {
          dispatch(addToast({ message: String(error), type: 'error' }));
        });
    }
    // Reset file input to allow importing the same file again
    e.target.value = '';
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('comicLibrary.title')}
      </h2>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow">
          <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder={t('comicLibrary.searchPlaceholder')}
            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <SortAscendingIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortOrder(e.target.value as SortOption)
            }
            className="appearance-none bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label={t('comicLibrary.sortBy')}
          >
            <option value="date-desc">
              {t('comicLibrary.sortDateNewest')}
            </option>
            <option value="date-asc">{t('comicLibrary.sortDateOldest')}</option>
            <option value="title-asc">{t('comicLibrary.sortTitleAZ')}</option>
          </select>
        </div>
         <button
            onClick={handleImportClick}
            className="p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Import project from .json file"
          >
            <UploadIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
      </div>
    </header>
  );
};

export default LibraryHeader;