
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  downloadBookToLibrary,
  setSelectedBookId,
} from '../../features/gutenbergSlice';
import type { LibraryBook } from '../../types';
import {
  BookOpenIcon,
  DownloadIcon,
  CheckCircleIcon,
  CogIcon,
  LinkIcon,
  RefreshCwIcon,
} from '../Icons';
import { addToast } from '../../features/uiSlice';

const SourceBadge: React.FC<{ source: LibraryBook['source'] }> = ({ source }) => {
    const styleMap: Record<LibraryBook['source'], { bg: string; text: string; border: string }> = {
        gutenberg: { bg: 'bg-gray-900/60', text: 'text-white', border: 'border-white/20' },
        openlibrary: { bg: 'bg-blue-600/60', text: 'text-white', border: 'border-white/20' },
    };
    const style = styleMap[source] || styleMap.gutenberg;
    return (
        <div className={`absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full z-10 backdrop-blur-md border ${style.bg} ${style.text} ${style.border} shadow-sm`}>
            {source}
        </div>
    );
};


interface BookCardProps {
  book: LibraryBook;
}

const BookCard: React.FC<BookCardProps> = React.memo(({ book }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { downloadStatus, localBooks } = useAppSelector(
    (state) => state.libraryBrowser,
  );

  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' },
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const isDownloading = downloadStatus[book.id] === 'loading';
  const downloadFailed = downloadStatus[book.id] === 'error';
  const isSaved =
    book.isLocal || localBooks.some((localBook) => localBook.id === book.id);

  const handleOpenWorkspace = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    dispatch(setSelectedBookId(book.id));
  };

  const handleDownload = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    dispatch(downloadBookToLibrary(book))
      .unwrap()
      .then((savedBook) => {
        dispatch(
          addToast({
            message: `"${savedBook.title}" saved to your library!`,
            type: 'success',
          }),
        );
      })
      .catch((error: unknown) => {
        dispatch(addToast({ message: String(error), type: 'error' }));
      });
  };

  const buttonBaseClass = "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg transform active:scale-95";

  const renderButton = () => {
    if (book.isLocal) {
      return (
        <button
          onClick={handleOpenWorkspace}
          className={`${buttonBaseClass} bg-white/90 text-indigo-900 hover:bg-white`}
        >
          <CogIcon className="w-4 h-4" />
          {t('importer.manageBook')}
        </button>
      );
    }
    
    if (downloadFailed) {
      return (
         <button
          onClick={handleDownload}
          className={`${buttonBaseClass} bg-red-500/90 text-white hover:bg-red-500`}
        >
          <RefreshCwIcon className="w-4 h-4" />
          {t('common.tryAgain')}
        </button>
      );
    }

    if (isSaved) {
      return (
        <button
          disabled
          className={`${buttonBaseClass} bg-emerald-500/90 text-white disabled:opacity-100 disabled:cursor-default`}
        >
          <CheckCircleIcon className="w-4 h-4" />
          {t('importer.saved')}
        </button>
      );
    }

    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`${buttonBaseClass} bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/40 disabled:opacity-50`}
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            {t('importer.downloading')}
          </>
        ) : (
          <>
            <DownloadIcon className="w-4 h-4" />
            {t('importer.addToLibrary')}
          </>
        )}
      </button>
    );
  };

  const handleClick = (e: React.SyntheticEvent) => {
      if (book.isLocal) {
          handleOpenWorkspace(e);
      } else {
          handleDownload(e);
      }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
      }
  };


  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      className="group relative rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden border border-gray-200 dark:border-gray-700 aspect-[2/3] cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/30 bg-white dark:bg-gray-800"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
        {isVisible ? (
          book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                <BookOpenIcon className="w-16 h-16 mb-2" />
            </div>
          )
        ) : (
          <div className="w-full h-full" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
      </div>

      <SourceBadge source={book.source} />
      
      {book.sourceUrl && (
        <a
            href={book.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/20 transform hover:scale-110"
            title="View original source"
            aria-label="View original source"
        >
            <LinkIcon className="w-4 h-4" />
        </a>
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        <h3
          className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1 drop-shadow-lg group-hover:text-indigo-200 transition-colors"
          title={book.title}
        >
          {book.title}
        </h3>
        <p
          className="text-gray-200 text-sm font-medium truncate mb-6 drop-shadow-md"
          title={book.author}
        >
          {t('importer.by')} {book.author}
        </p>
        <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            {renderButton()}
        </div>
      </div>
      
       {downloadFailed && (
            <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-red-400/50">
                {t('importer.downloadFailed')}
            </div>
        )}
    </div>
  );
});

export default BookCard;
