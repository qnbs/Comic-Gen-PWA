import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { GenerationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import {
  UploadCloudIcon,
  EditIcon,
  SparklesIcon,
  Wand2Icon,
  CogIcon,
  DownloadIcon,
  ArchiveIcon,
  PdfIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './Icons';
import BookImporter from './BookImporter';
import Loader from './Loader';
import ComicPage from './ComicPage';
import CharacterDefinition from './CharacterDefinition';
import SceneReview from './SceneReview';
import { resetApp } from '../features/generationSlice';
import {
  exportPanelsAsZip,
  setCurrentPage,
  exportPageAsPdf,
} from '../features/uiSlice';

const CreatorWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const comicPageRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(0.5);

  const { generationState, error, comicPage } = useAppSelector(
    (state) => state.generation,
  );
  const { isExportingZip, isExportingPdf, isDownloading } = useAppSelector(
    (state) => state.ui,
  );
  const comicSettings = useAppSelector((state) => state.settings);

  const getStepIndex = () => {
    switch (generationState) {
      case GenerationState.IDLE:
        return 0;
      case GenerationState.REVIEW_SCENES:
        return 1;
      case GenerationState.CHARACTER_DEFINITION:
        return 2;
      case GenerationState.DONE:
        return 3;
      default:
        return -1; // Represents a loading state between steps
    }
  };
  const currentStepIndex = getStepIndex();

  const steps = [
    {
      name: t('creatorWorkspace.stepImport'),
      icon: <UploadCloudIcon className="w-5 h-5" />,
    },
    {
      name: t('creatorWorkspace.stepScript'),
      icon: <EditIcon className="w-5 h-5" />,
    },
    {
      name: t('creatorWorkspace.stepCharacters'),
      icon: <SparklesIcon className="w-5 h-5" />,
    },
    { name: t('creatorWorkspace.stepPage'), icon: <Wand2Icon className="w-5 h-5" /> },
  ];

  const handlePdfExport = () => {
    if (comicPageRef.current) {
      dispatch(exportPageAsPdf({ pageElement: comicPageRef.current }));
    }
  };

  const renderContent = () => {
    switch (generationState) {
      case GenerationState.IDLE:
        return <BookImporter />;
      case GenerationState.REVIEW_SCENES:
        return <SceneReview />;
      case GenerationState.CHARACTER_DEFINITION:
        return <CharacterDefinition />;
      case GenerationState.DONE:
        return comicPage ? (
          <div className="w-full h-[calc(100vh-250px)] sm:h-[calc(100vh-220px)] overflow-auto border border-gray-400 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 rounded-lg flex justify-start items-start p-4">
            <ComicPage
              ref={comicPageRef}
              page={comicPage}
              settings={comicSettings}
              scale={zoom}
            />
          </div>
        ) : (
          <p>{t('error.somethingWentWrong')}</p>
        );
      case GenerationState.ERROR:
        return (
          <div className="text-center text-red-500 dark:text-red-400 p-8">
            <h2 className="text-2xl font-bold mb-4">
              {t('error.generationFailed')}
            </h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => dispatch(resetApp())}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition-colors"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        );
      default:
        return <Loader state={generationState} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Stepper UI */}
      <nav aria-label="Progress" className="w-full max-w-2xl mb-8">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={`relative ${
                stepIdx !== steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              {stepIdx <= currentStepIndex ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-0.5 w-full ${
                        stepIdx < currentStepIndex
                          ? 'bg-indigo-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></div>
                  </div>
                  <div className="relative w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full">
                    <span className="text-white">{step.icon}</span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                    {step.name}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="relative w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                    <span className="text-gray-500 dark:text-gray-400">
                      {step.icon}
                    </span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {step.name}
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Content Area */}
      <div className="w-full mt-12">{renderContent()}</div>

      {/* Floating Action Buttons & Zoom for Final Page */}
      {generationState === GenerationState.DONE && (
        <>
          <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-2 rounded-full shadow-lg backdrop-blur-md border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('creatorWorkspace.zoomOut')}
            >
              <ZoomOutIcon className="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={zoom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setZoom(parseFloat(e.target.value))
              }
              className="w-32 sm:w-48"
            />
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('creatorWorkspace.zoomIn')}
            >
              <ZoomInIcon className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono w-12 text-center p-1 bg-gray-100 dark:bg-gray-900 rounded-md">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-4 items-end">
            <div className="flex gap-2 sm:gap-4 items-center bg-white/50 dark:bg-gray-800/50 p-2 rounded-full shadow-lg backdrop-blur-md border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => dispatch(exportPanelsAsZip())}
                disabled={isExportingZip}
                className="p-2 sm:p-3 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                aria-label={t('comic.exportZip')}
              >
                {isExportingZip ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  <ArchiveIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
              <button
                onClick={handlePdfExport}
                disabled={isExportingPdf}
                className="p-2 sm:p-3 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                aria-label={t('comic.exportPdf')}
              >
                {isExportingPdf ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  <PdfIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
              <button
                disabled={isDownloading}
                className="p-2 sm:p-3 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                aria-label={t('comic.download')}
              >
                {isDownloading ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  <DownloadIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
              <button
                onClick={() => dispatch(setCurrentPage('settings'))}
                className="p-2 sm:p-3 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105"
                aria-label={t('settings.title')}
              >
                <CogIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button
                onClick={() => dispatch(resetApp())}
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105"
              >
                {t('comic.createNew')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorWorkspace;
