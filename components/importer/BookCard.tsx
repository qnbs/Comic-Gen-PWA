import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createProject } from '../../features/generationSlice';
import { fetchBookText, LibraryBook } from '../../services/gutendexService';
import { BookOpenIcon, DownloadIcon } from '../Icons';
import { addToast } from '../../features/uiSlice';

interface BookCardProps {
  book: LibraryBook;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerate = async () => {
    if (!book.textUrl) {
      dispatch(addToast({ message: t('importer.noTextFile', { title: book.title }), type: 'error' }));
      return;
    }

    setIsLoading(true);
    try {
      const text = await fetchBookText(book.textUrl);
      dispatch(createProject({ text, title: book.title, language }));
    } catch (error) {
      console.error(error);
      dispatch(addToast({ message: t('importer.downloadError'), type: 'error' }));
      setIsLoading(false);
    }
    // Don't setIsLoading(false) on success, as the app will transition away.
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpenIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-md leading-snug truncate" title={book.title}>{book.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={book.author}>{t('importer.by')} {book.author}</p>
        <div className="mt-auto pt-4">
           <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 rounded-lg font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                {t('importer.downloading')}
              </>
            ) : (
              t('importer.generate')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;