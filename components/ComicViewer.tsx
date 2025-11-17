import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useTranslation } from '../hooks/useTranslation';
import { setGenerationStep, reorderPages } from '../features/generationSlice';
import { exportProjectAsPdf, exportProjectAsCbz } from '../features/uiSlice';
import { ProjectGenerationState } from '../types';
import { BookOpenIcon, DownloadIcon, PdfIcon } from './Icons';

const ComicPage = React.lazy(() => import('./ComicPage'));

const ComicViewer: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { project } = useAppSelector((state) => state.generation);
    const settings = useAppSelector((state) => state.settings);
    const { isExportingPdf, isDownloading } = useAppSelector((state) => state.ui);
    const [scale] = React.useState(0.5); // Fixed scale for now

    // Drag and Drop State
    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    if (!project) {
        return <div>Loading project...</div>;
    }

    const handleExportPdf = () => {
        dispatch(exportProjectAsPdf({ project }));
    };

    const handleExportCbz = () => {
        dispatch(exportProjectAsCbz({ project }));
    };
    
    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.currentTarget.classList.add('dragging-ghost');
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
        setDragOverIndex(index);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('dragging-ghost');
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            dispatch(reorderPages({ fromIndex: dragItem.current, toIndex: dragOverItem.current }));
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverIndex(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
            <div className="w-full max-w-4xl p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-300 dark:border-gray-700 shadow-xl mb-8 backdrop-blur-sm sticky top-4 z-10">
                <div className="text-center mb-4">
                     <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
                        <BookOpenIcon className="w-8 h-8" />
                        {t('comicViewer.title')}
                    </h2>
                     <p className="text-gray-600 dark:text-gray-400 mt-2">{t('comicViewer.subtitle')}</p>
                </div>
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => dispatch(setGenerationStep(ProjectGenerationState.DONE))}
                        className="w-full sm:w-auto py-2 px-5 bg-gray-500 rounded-lg font-semibold text-white shadow-md hover:bg-gray-600"
                    >
                        {t('comicViewer.backToDashboard')}
                    </button>
                    <div className="flex items-center gap-4">
                         <button onClick={handleExportPdf} disabled={isExportingPdf} className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
                            {isExportingPdf ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <PdfIcon className="w-5 h-5" />}
                            {t('comicViewer.exportPdf')}
                        </button>
                         <button onClick={handleExportCbz} disabled={isDownloading} className="flex items-center gap-2 py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400">
                            {isDownloading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <DownloadIcon className="w-5 h-5" />}
                            {t('comicViewer.exportCbz')}
                        </button>
                    </div>
                </div>
            </div>
            <React.Suspense fallback={<div className="text-center p-10">Loading pages...</div>}>
                <div className="space-y-8">
                    {project.pages.map((page, index) => (
                        <React.Fragment key={page.pageNumber}>
                            {dragOverIndex === index && dragOverItem.current !== dragItem.current && <div className="drop-indicator my-2" style={{ width: `${1100 * scale}px`, marginLeft: 'auto', marginRight: 'auto' }}></div>}
                            <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative cursor-move"
                            >
                                <span className="absolute -top-4 -left-4 bg-indigo-600 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg z-10 select-none">
                                    {page.pageNumber}
                                </span>
                                <ComicPage
                                page={page}
                                settings={settings}
                                scale={scale} 
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </React.Suspense>
        </div>
    );
};

export default ComicViewer;