import React from 'react';
import { ActionCreators } from 'redux-undo';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, CheckCircleIcon, LoaderIcon, XCircleIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { setViewerZoomLevel, setSaveStatus } from '../features/uiSlice';

const SaveStatusIndicator: React.FC = () => {
    const dispatch = useAppDispatch();
    const { saveStatus } = useAppSelector((state) => state.ui);

    React.useEffect(() => {
        if (saveStatus === 'saved' || saveStatus === 'error') {
            const timer = setTimeout(() => {
                dispatch(setSaveStatus('idle'));
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [saveStatus, dispatch]);
    
    if (saveStatus === 'idle') {
        return null;
    }

    const statusMap = {
        saving: { icon: <LoaderIcon className="w-4 h-4 animate-spin"/>, text: 'Saving...', color: 'text-gray-500 dark:text-gray-400' },
        saved: { icon: <CheckCircleIcon className="w-4 h-4"/>, text: 'Saved', color: 'text-green-600 dark:text-green-400' },
        error: { icon: <XCircleIcon className="w-4 h-4"/>, text: 'Save Error', color: 'text-red-600 dark:text-red-400' },
    };

    const currentStatus = statusMap[saveStatus];

    return (
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium pr-2 ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
}

const WorkspaceToolbar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { activeContext } = useAppSelector((state) => state.project.present);
  const { viewerZoomLevel } = useAppSelector((state) => state.ui);
  const canUndo = useAppSelector((state) => state.project.past.length > 0);
  const canRedo = useAppSelector((state) => state.project.future.length > 0);

  const isViewingPages = activeContext.type === 'page' || activeContext.type === 'panel';

  const handleUndo = React.useCallback(() => {
    if (canUndo) {
      dispatch(ActionCreators.undo());
    }
  }, [canUndo, dispatch]);

  const handleRedo = React.useCallback(() => {
    if (canRedo) {
      dispatch(ActionCreators.redo());
    }
  }, [canRedo, dispatch]);

  return (
    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-full flex items-center gap-1 sm:gap-2 p-1.5 border border-gray-200 dark:border-gray-700 max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar transition-all hover:bg-white/95 dark:hover:bg-gray-800/95 ring-1 ring-black/5">
      <SaveStatusIndicator />
      <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className="p-2.5 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
        aria-label={t('common.undo')}
        title={t('common.undo')}
      >
        <UndoIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className="p-2.5 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
        aria-label={t('common.redo')}
        title={t('common.redo')}
      >
        <RedoIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </button>

      {isViewingPages && (
        <>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button onClick={() => dispatch(setViewerZoomLevel(viewerZoomLevel - 0.25))} className="p-2.5 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90" aria-label={t('creatorWorkspace.zoomOut')} title={t('creatorWorkspace.zoomOut')}>
                <ZoomOutIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
            <div className="hidden sm:block px-2">
                 <input 
                    type="range" 
                    min="0.25" 
                    max="4" 
                    step="0.05" 
                    value={viewerZoomLevel}
                    onChange={e => dispatch(setViewerZoomLevel(parseFloat(e.target.value)))}
                    className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>
             <button onClick={() => dispatch(setViewerZoomLevel(viewerZoomLevel + 0.25))} className="p-2.5 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90" aria-label={t('creatorWorkspace.zoomIn')} title={t('creatorWorkspace.zoomIn')}>
                <ZoomInIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
        </>
      )}
    </div>
  );
};

export default React.memo(WorkspaceToolbar);