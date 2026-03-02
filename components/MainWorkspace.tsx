import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCurrentPage } from '../features/uiSlice';
import WorkspaceToolbar from './WorkspaceToolbar';
import { MenuIcon, PanelRightIcon, XIcon, LibraryIcon, CogIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

const ProjectNavigator = React.lazy(() => import('./workspace/ProjectNavigator'));
const ContextualInspector = React.lazy(() => import('./workspace/ContextualInspector'));
const ProjectOverview = React.lazy(() => import('./workspace/ProjectOverview'));
const SceneEditor = React.lazy(() => import('./workspace/SceneEditor'));
const PageViewer = React.lazy(() => import('./workspace/PageViewer'));
const WorldBuilder = React.lazy(() => import('./workspace/WorldBuilder'));
const PageComposer = React.lazy(() => import('./workspace/PageComposer'));
const ComicViewer = React.lazy(() => import('./ComicViewer'));

const MainWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { project, activeContext } = useAppSelector(
    (state) => state.project.present,
  );
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);

  const renderMainContent = () => {
    if (!project) return null;

    switch (activeContext.type) {
      case 'overview':
        return <ProjectOverview />;
      case 'chapter':
      case 'scene':
        return <SceneEditor />;
      case 'page':
      case 'panel':
        return <PageViewer />;
      case 'world-characters':
      case 'world-locations':
      case 'world-props':
        return <WorldBuilder />;
      case 'page-layout':
        return <PageComposer />;
      case 'comic-viewer':
        return <ComicViewer />;
      default:
        return <ProjectOverview />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
      {/* Mobile Header - Clean, native app feel */}
      <header className="lg:hidden h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-30 shadow-sm">
        <button
          onClick={() => setIsNavOpen(true)}
          className="p-2 -ml-2 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 rounded-full"
          aria-label={t('navigation.openMenu')}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[50vw]">
           {project?.title || 'Comic-Gen'}
        </div>
        <div className="flex items-center gap-1">
             <button
                onClick={() => dispatch(setCurrentPage('library'))}
                className="p-2 text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-full"
              aria-label={t('navigation.backToLibrary')}
            >
                <LibraryIcon className="w-6 h-6" />
            </button>
             <button
                onClick={() => setIsInspectorOpen(true)}
                className="p-2 -mr-2 text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-full"
              aria-label={t('navigation.openInspector')}
            >
            <PanelRightIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Navigator Panel (Drawer on Mobile) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] sm:w-72 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:shadow-none lg:border-r border-gray-200 dark:border-gray-700 flex flex-col ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('navigation.projectMenu')}</h2>
             <button onClick={() => setIsNavOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
        <div className="flex-grow overflow-hidden">
            <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">{t('loader.loading')}</div>}>
              <ProjectNavigator />
            </React.Suspense>
        </div>
         {/* Mobile Settings Link in Drawer */}
        <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button 
                onClick={() => dispatch(setCurrentPage('settings'))}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <CogIcon className="w-5 h-5" /> {t('navigation.settings')}
            </button>
        </div>
      </div>
      
      {/* Mobile Backdrop for Navigator */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-grow relative flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        <div className="flex-grow overflow-y-auto scroll-smooth overscroll-none">
             {/* Add padding bottom to prevent content being hidden behind the floating toolbar */}
             <div className="pb-28 min-h-full"> 
                <React.Suspense fallback={<div className="p-6 text-gray-500 dark:text-gray-400">{t('loader.loading')}</div>}>
                  {renderMainContent()}
                </React.Suspense>
             </div>
        </div>
        <WorkspaceToolbar />
      </main>

      {/* Inspector Panel (Drawer on Mobile) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[85vw] sm:w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 lg:shadow-none lg:border-l border-gray-200 dark:border-gray-700 flex flex-col ${
          isInspectorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
         <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('navigation.inspector')}</h2>
             <button onClick={() => setIsInspectorOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
        <div className="flex-grow overflow-hidden">
             <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">{t('loader.loading')}</div>}>
               <ContextualInspector />
             </React.Suspense>
        </div>
      </aside>

      {/* Mobile Backdrop for Inspector */}
      {isInspectorOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsInspectorOpen(false)}
        />
      )}
    </div>
  );
};

export default MainWorkspace;