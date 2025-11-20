import React from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setCurrentPage } from './features/uiSlice';
import { loadProjectById } from './features/projectSlice';
import CreatorWorkspace from './components/CreatorWorkspace';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import ComicLibrary from './components/ComicLibrary';
import ToastContainer from './components/ToastContainer';
import OnboardingWizard from './components/OnboardingWizard';
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

  const { theme, currentPage } = useAppSelector((state) => state.ui);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoadProject = (projectId: string) => {
    dispatch(loadProjectById(projectId));
    dispatch(setCurrentPage('creator'));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'creator':
        return <CreatorWorkspace />;
      case 'settings':
        return (
          <SettingsPage onBack={() => dispatch(setCurrentPage('creator'))} />
        );
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
      <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-0 sm:p-8">
        {currentPage !== 'creator' && (
          <header className="w-full max-w-5xl text-center mb-8 relative px-4 pt-4 sm:pt-0">
            <div className="absolute top-4 sm:top-0 right-4 sm:right-0 flex items-center gap-2">
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
              className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-2 sm:gap-4 cursor-pointer"
              onClick={() => dispatch(setCurrentPage('creator'))}
            >
              <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              Comic-Gen PWA
              <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </h1>
            <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-gray-600 dark:text-gray-400">
              {t('app.subtitle')}
            </p>
          </header>
        )}

        <main className="w-full h-full flex-grow flex items-center justify-center overflow-hidden sm:rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border-0 sm:border border-gray-200 dark:border-gray-700">
          {renderContent()}
        </main>

        <footer className="w-full max-w-5xl text-center mt-4 sm:mt-8 pb-4 text-gray-500 dark:text-gray-500 text-xs sm:text-sm px-4">
          <p>{t('app.footer')}</p>
        </footer>
      </div>
      <ToastContainer />
      <OnboardingWizard />
    </>
  );
};

export default App;