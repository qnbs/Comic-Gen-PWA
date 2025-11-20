import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProjects } from '../features/librarySlice';
import { setCurrentPage } from '../features/uiSlice';
import { useTranslation } from '../hooks/useTranslation';
import {
  ComicLibraryProvider,
  useComicLibraryContext,
} from '../contexts/ComicLibraryContext';
import LibraryHeader from './comic-library/LibraryHeader';
import ComicGrid from './comic-library/ComicGrid';
import LibraryFooter from './comic-library/LibraryFooter';
import DeleteConfirmModal from './comic-library/DeleteConfirmModal';
import { LibraryIcon } from './Icons';

interface ComicLibraryProps {
  onLoadProject: (projectId: string) => void;
  onBack: () => void;
}

const ComicLibraryContent: React.FC<ComicLibraryProps> = ({ onLoadProject }) => {
  const { status } = useAppSelector((state) => state.library);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { filteredAndSortedProjects } = useComicLibraryContext();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mt-1 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl flex flex-col">
      <LibraryHeader />

      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-20 flex-grow flex flex-col items-center justify-center">
          <LibraryIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-2xl font-bold">{t('comicLibrary.emptyTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
            {t('comicLibrary.emptyBody')}
          </p>
          <button
            onClick={() => dispatch(setCurrentPage('creator'))}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('comicLibrary.emptyAction')}
          </button>
        </div>
      ) : (
        <ComicGrid onLoadProject={onLoadProject} />
      )}

      <LibraryFooter />
      <DeleteConfirmModal />
    </div>
  );
};

const ComicLibrary: React.FC<ComicLibraryProps> = ({ onLoadProject, onBack }) => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.library);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  return (
    <ComicLibraryProvider>
      <ComicLibraryContent onLoadProject={onLoadProject} onBack={onBack} />
    </ComicLibraryProvider>
  );
};

export default ComicLibrary;
