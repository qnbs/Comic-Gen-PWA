import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import { SearchIcon, SortAscendingIcon } from '../Icons';
import { SortOption } from './types';

const LibraryHeader: React.FC = () => {
    const { t } = useTranslation();
    const { searchQuery, setSearchQuery, sortOrder, setSortOrder } = useComicLibraryContext();

    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
                {t('comicLibrary.title')}
            </h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-grow">
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        placeholder={t('comicLibrary.searchPlaceholder')} 
                        className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="relative">
                    <SortAscendingIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <select 
                        value={sortOrder} 
                        onChange={e => setSortOrder(e.target.value as SortOption)} 
                        className="appearance-none bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label={t('comicLibrary.sortBy')}
                    >
                        <option value="date-desc">{t('comicLibrary.sortDateNewest')}</option>
                        <option value="date-asc">{t('comicLibrary.sortDateOldest')}</option>
                        <option value="title-asc">{t('comicLibrary.sortTitleAZ')}</option>
                    </select>
                </div>
            </div>
      </header>
    );
};

export default LibraryHeader;