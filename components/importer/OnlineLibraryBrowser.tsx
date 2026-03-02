
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  searchOnlineBooks,
  setOnlineSearchQuery,
  toggleSource,
} from '../../features/gutenbergSlice';
import BookCard from './BookCard';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchIcon, LoaderIcon, XCircleIcon, XIcon, CheckIcon } from '../Icons';
import type { LibrarySource } from '../../types';

const SourceFilterButton: React.FC<{ source: LibrarySource; isEnabled: boolean; onClick: () => void }> = ({ source, isEnabled, onClick }) => {
    const styleMap: Record<LibrarySource, { active: string; inactive: string }> = {
        gutenberg: { active: 'bg-gray-900 text-white border-gray-900', inactive: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200' },
        openlibrary: { active: 'bg-blue-600 text-white border-blue-600', inactive: 'bg-blue-50 text-blue-500 border-blue-100 hover:bg-blue-100' },
    };
    
    // Default fallback
    const style = styleMap[source] || styleMap.gutenberg;
    const currentStateClass = isEnabled ? style.active : `${style.inactive} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400`;

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 shadow-sm ${currentStateClass}`}
        >
            {isEnabled && <CheckIcon className="w-3 h-3" />}
            {source}
        </button>
    );
};

const OnlineLibraryBrowser: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { onlineBooks, onlineStatus, error, onlineSearchQuery, enabledSources } = useAppSelector(
    (state) => state.libraryBrowser,
  );

  const [searchTerm, setSearchTerm] = useState(onlineSearchQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    // Only dispatch if the debounced term has actually changed from the one in the store
    if (debouncedSearchTerm !== onlineSearchQuery) {
        dispatch(setOnlineSearchQuery(debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, onlineSearchQuery, dispatch]);

  // Trigger search when query in store changes or sources change
  useEffect(() => {
    // Small delay to prevent double firing on initial mount if query exists
    const timer = setTimeout(() => {
        dispatch(searchOnlineBooks());
    }, 50);
    return () => clearTimeout(timer);
  }, [onlineSearchQuery, enabledSources, dispatch]);

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 12);
  };

  const handleToggleSource = (source: LibrarySource) => {
      dispatch(toggleSource(source));
  };

  const renderGrid = () => {
    if (onlineStatus === 'loading') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md mt-2 w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (onlineBooks.length === 0 && onlineStatus === 'succeeded') {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h4 className="font-bold text-lg mb-1">{t('importer.noResults')}</h4>
            <p className="text-sm">{t('importer.noResultsHint')}</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {onlineBooks.slice(0, visibleCount).map((book) => (
                <BookCard key={`${book.source}-${book.id}`} book={book} />
            ))}
        </div>
        {visibleCount < onlineBooks.length && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow transition-all text-indigo-600 dark:text-indigo-400"
            >
              {t('importer.loadMore')}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <div className="mb-6 max-w-3xl mx-auto">
        <div className="relative group mb-4">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
             <SearchIcon className="w-6 h-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('importer.searchBooks')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('importer.searchBooks')}
            className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-14 pr-12 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg shadow-lg hover:shadow-xl"
          />
          {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                title={t('importer.clearSearch')}
              >
                  <XIcon className="w-5 h-5"/>
              </button>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center mr-1">{t('importer.sourcesLabel')}</span>
            <SourceFilterButton source="gutenberg" isEnabled={enabledSources.includes('gutenberg')} onClick={() => handleToggleSource('gutenberg')} />
            <SourceFilterButton source="openlibrary" isEnabled={enabledSources.includes('openlibrary')} onClick={() => handleToggleSource('openlibrary')} />
        </div>
      </div>

      {onlineStatus === 'failed' && (
        <div className="mb-8 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
            <div className="flex flex-col items-center justify-center gap-2 text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">{error || t('importer.fetchError')}</span>
                </div>
                <button onClick={() => dispatch(searchOnlineBooks())} className="text-sm underline hover:no-underline font-medium">
                  {t('common.tryAgain')}
                </button>
            </div>
        </div>
      )}

      {renderGrid()}
    </div>
  );
};

export default OnlineLibraryBrowser;
