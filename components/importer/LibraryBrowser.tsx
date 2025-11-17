import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppSelector } from '../../app/hooks';
import { fetchPublicBooks, LibraryBook } from '../../services/gutendexService';
import BookCard from './BookCard';
import { BookOpenIcon } from '../Icons';

const LibraryBrowser: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useAppSelector((state) => state.ui);
  const [books, setBooks] = React.useState<LibraryBook[]>([]);
  const [nextPageUrl, setNextPageUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadBooks = React.useCallback(async (url?: string) => {
    const loadingMore = !!url;
    if (loadingMore) setIsLoadingMore(true);
    else setIsLoading(true);
    
    setError(null);

    try {
      const { books: newBooks, nextPageUrl: nextUrl } = await fetchPublicBooks(language, url);
      setBooks(prev => loadingMore ? [...prev, ...newBooks] : newBooks);
      setNextPageUrl(nextUrl);
    } catch (err) {
      setError(t('importer.fetchError'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [language, t]);

  React.useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mt-1 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <div>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">{t('importer.browseDescription')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.map(book => <BookCard key={book.id} book={book} />)}
      </div>
      {nextPageUrl && (
        <div className="text-center mt-8">
          <button 
            onClick={() => loadBooks(nextPageUrl)}
            disabled={isLoadingMore}
            className="py-2 px-6 bg-gray-600 rounded-lg font-bold text-white transition-colors hover:bg-gray-700 disabled:bg-gray-500"
          >
            {isLoadingMore ? t('importer.loadingMore') : t('importer.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryBrowser;