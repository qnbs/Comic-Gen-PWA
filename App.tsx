import React from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setCurrentPage } from './features/uiSlice';
import { loadProject } from './features/generationSlice';
import { ComicProject } from './types';
import CreatorWorkspace from './components/CreatorWorkspace';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import ComicLibrary from './components/ComicLibrary';
import ToastContainer from './components/ToastContainer';
import {
  BookOpenIcon,
  SparklesIcon,
  CogIcon,
  HelpCircleIcon,
  LibraryIcon,
} from './components/Icons';
import { useTranslation } from './hooks/useTranslation';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { theme } = useAppSelector((state) => state.ui);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Theme persistence is now handled by persistenceMiddleware
  }, [theme]);

  const handleLoadProject = (project: ComicProject) => {
    // Blob URL revocation is now handled within the ComicPage component's lifecycle
    // to prevent memory leaks and premature revocation.
    dispatch(loadProject(project));
    dispatch(setCurrentPage('creator'));
  };

  const renderContent = () => {
    const { currentPage } = useAppSelector((state) => state.ui);
    switch (currentPage) {
      case 'creator':
        return <CreatorWorkspace />;
      case 'settings':
        return <SettingsPage onBack={() => dispatch(setCurrentPage('creator'))} />;
      case 'help':
        return <HelpPage onBack={() => dispatch(setCurrentPage('creator'))} />;
      case 'library':
        return (
          <ComicLibrary
            onLoadProject={handleLoadProject}
            onBack={() => dispatch(setCurrentPage('creator'))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
        <header className="w-full max-w-5xl text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <button
              onClick={() => dispatch(setCurrentPage('library'))}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('comicLibrary.title')}
            >
              <LibraryIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => dispatch(setCurrentPage('settings'))}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('settings.title')}
            >
              <CogIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => dispatch(setCurrentPage('help'))}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('helpPage.title')}
            >
              <HelpCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-4 cursor-pointer"
            onClick={() => dispatch(setCurrentPage('creator'))}
          >
            <BookOpenIcon className="w-10 h-10" />
            Comic-Gen PWA
            <SparklesIcon className="w-10 h-10" />
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t('app.subtitle')}
          </p>
        </header>

        <main className="w-full flex-grow flex items-center justify-center">
          {renderContent()}
        </main>

        <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 dark:text-gray-500 text-sm">
          <p>{t('app.footer')}</p>
        </footer>
      </div>
      <ToastContainer />
    </>
  );
};

export default App;