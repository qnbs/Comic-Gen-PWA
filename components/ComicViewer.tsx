import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useTranslation } from '../hooks/useTranslation';
import { reorderPages, setActiveContext } from '../features/projectSlice';
import { exportProjectAsPdf, exportProjectAsCbz } from '../features/uiSlice';
import ComicPage from './ComicPage';
import { AppSettings, ComicBookPage } from '../types';
import { PdfIcon, DownloadIcon, ScissorsIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

// --- Hook and Context for Component Logic ---

interface ComicViewerContextType {
  project: NonNullable<ReturnType<typeof useAppSelector>['project']['present']['project']>;
  settings: AppSettings;
  isDownloading: boolean;
  isExportingPdf: boolean;
  draggedIndex: number | null;
  dropIndex: number | null;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragEnter: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleMovePage: (index: number, direction: 'up' | 'down') => void;
}

const ComicViewerContext = React.createContext<ComicViewerContextType | undefined>(undefined);

const useComicViewerContext = () => {
  const context = React.useContext(ComicViewerContext);
  if (!context) {
    throw new Error('useComicViewerContext must be used within a ComicViewerProvider');
  }
  return context;
};

const useComicViewer = () => {
  const dispatch = useAppDispatch();
  const { project } = useAppSelector((state) => state.project.present);
  const { isDownloading, isExportingPdf } = useAppSelector((state) => state.ui);
  const settings = useAppSelector((state) => state.settings);

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging-ghost');
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== draggedIndex) {
      setDropIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging-ghost');
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      dispatch(reorderPages({ fromIndex: draggedIndex, toIndex: index }));
    }
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    if (project && toIndex >= 0 && toIndex < project.pages.length) {
      dispatch(reorderPages({ fromIndex: index, toIndex }));
    }
  };

  if (!project) {
    return null;
  }

  return {
    project,
    settings,
    isDownloading,
    isExportingPdf,
    draggedIndex,
    dropIndex,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleMovePage,
  };
};

// --- UI Components ---

interface PageThumbnailProps {
  page: ComicBookPage;
  index: number;
}

const PageThumbnail: React.FC<PageThumbnailProps> = React.memo(({ page, index }) => {
  const dispatch = useAppDispatch();
  const {
    settings,
    draggedIndex,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleMovePage,
    project,
  } = useComicViewerContext();
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const newWidth = entries[0].contentRect.width;
        setScale(newWidth / 1100);
      }
    });
    const currentRef = containerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={() => dispatch(setActiveContext({ type: 'page', id: page.pageNumber }))}
      className={`w-full relative shadow-lg rounded-lg border-2 cursor-pointer transition-all duration-300 group focus-within:border-indigo-500 ${
        draggedIndex === index
          ? 'border-indigo-500 scale-105 shadow-2xl'
          : 'border-transparent hover:border-indigo-400'
      }`}
      style={{ aspectRatio: '1100 / 1600' }}
      draggable="true"
      onDragStart={(e) => handleDragStart(e, index)}
      onDragEnter={(e) => handleDragEnter(e, index)}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDrop={(e) => handleDrop(e, index)}
      tabIndex={0}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md">
        {scale > 0 && <ComicPage page={page} settings={settings} dynamicScale={scale} />}
      </div>
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
        {page.pageNumber}
      </div>
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); handleMovePage(index, 'up'); }} disabled={index === 0} className="p-2 bg-white/80 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowUpIcon className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleMovePage(index, 'down'); }} disabled={index === project.pages.length - 1} className="p-2 bg-white/80 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowDownIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

const ComicViewerContent: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { project, isDownloading, isExportingPdf, dropIndex } = useComicViewerContext();

  const handleExportPdf = () => dispatch(exportProjectAsPdf({ project }));
  const handleExportCbz = () => dispatch(exportProjectAsCbz({ project }));

  return (
    <div className="w-full h-full p-8 flex flex-col overflow-y-auto">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
            {t('comicViewer.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('comicViewer.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} disabled={isExportingPdf} className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
            <PdfIcon className="w-5 h-5" /> {isExportingPdf ? t('common.generating') : t('comicViewer.exportPdf')}
          </button>
          <button onClick={handleExportCbz} disabled={isDownloading} className="flex items-center gap-2 py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400">
            <DownloadIcon className="w-5 h-5" /> {isDownloading ? t('common.generating') : t('comicViewer.exportCbz')}
          </button>
        </div>
      </header>

      {project.pages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {project.pages.map((page, index) => (
            <div key={page.pageNumber} className="relative">
              {dropIndex === index && <div className="absolute -top-2 left-0 w-full drop-indicator"></div>}
              <PageThumbnail page={page} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('comicViewer.emptyTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6 max-w-sm">
            {t('comicViewer.emptyDescription')}
          </p>
          <button onClick={() => dispatch(setActiveContext({ type: 'page-layout', chapterId: 0 }))} className="flex items-center gap-2 py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            <ScissorsIcon className="w-5 h-5" />
            {t('comicViewer.goToLayout')}
          </button>
        </div>
      )}
    </div>
  );
};

const ComicViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useComicViewer();
  if (!value) return null; // or a loading/error state
  return <ComicViewerContext.Provider value={value}>{children}</ComicViewerContext.Provider>;
};

const ComicViewer: React.FC = () => {
  return (
    <ComicViewerProvider>
      <ComicViewerContent />
    </ComicViewerProvider>
  );
};

export default ComicViewer;