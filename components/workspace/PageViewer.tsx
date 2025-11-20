import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import ComicPage from '../ComicPage';
import { setActiveContext } from '../../features/projectSlice';
import { BookOpenIcon } from '../Icons';

const PageViewer: React.FC = () => {
    const dispatch = useAppDispatch();
    const { project, activeContext } = useAppSelector(state => state.project.present);
    const settings = useAppSelector(state => state.settings);
    const { viewerZoomLevel } = useAppSelector(state => state.ui);

    const [dynamicScale, setDynamicScale] = React.useState(1);
    const pageContainerRef = React.useRef<HTMLDivElement>(null);

     React.useEffect(() => {
        const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const newWidth = entry.contentRect.width;
            setDynamicScale(newWidth / 1100);
        }
        });

        const currentRef = pageContainerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [viewerZoomLevel]);


    if (!project || (activeContext.type !== 'page' && activeContext.type !== 'panel')) return null;

    const pageNumber = activeContext.type === 'page' ? activeContext.id : activeContext.pageId;
    const page = project.pages.find(p => p.pageNumber === pageNumber);

    if (!page) return (
         <div className="p-8 h-full overflow-y-auto text-center">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
        </div>
    );

    return (
        <div className="w-full h-full p-8 flex flex-col items-center overflow-y-auto">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
                    <BookOpenIcon className="w-7 h-7" />
                    Page {page.pageNumber}
                </h2>
             </div>
             <div
                ref={pageContainerRef}
                className="w-full"
                style={{ maxWidth: '1100px' }}
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const panelDiv = target.closest('.group');
                    if (panelDiv) {
                        const panelId = panelDiv.getAttribute('data-panel-id');
                        if (panelId) {
                            dispatch(setActiveContext({ type: 'panel', pageId: page.pageNumber, panelId }));
                        }
                    }
                }}
            >
                <div style={{ aspectRatio: '1100 / 1600' }} className="relative">
                     {dynamicScale > 0 && (
                      <ComicPage
                        page={page}
                        settings={settings}
                        dynamicScale={dynamicScale}
                      />
                    )}
                </div>
             </div>
        </div>
    );
};

export default PageViewer;
