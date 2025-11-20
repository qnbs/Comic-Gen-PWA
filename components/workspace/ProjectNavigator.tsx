
import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setActiveContext } from '../../features/projectSlice';
import { BookOpenIcon, SparklesIcon, ImageIcon, ScissorsIcon, ChevronRightIcon } from '../Icons';

const NavItem: React.FC<{
  label: string;
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  level?: number;
}> = React.memo(({ label, onClick, isActive, icon, level = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm font-medium flex items-center gap-2 rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      style={{ padding: `0.5rem 0.75rem 0.5rem ${0.75 + level * 1}rem` }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="truncate flex-grow">{label}</span>
      <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
    </button>
  );
});

const ProjectNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { project, activeContext } = useAppSelector((state) => state.project.present);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  if (!project) return null;

  const toggle = (key: string) => {
    setExpanded(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="w-full h-full bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4 truncate" title={project.title}>
        {project.title}
      </h2>
      <nav className="flex-grow space-y-2 overflow-y-auto">
        <NavItem
          label="Project Overview"
          onClick={() => dispatch(setActiveContext({ type: 'overview' }))}
          isActive={activeContext.type === 'overview'}
          icon={<BookOpenIcon className="w-4 h-4" />}
        />
        
        {/* Chapters and Scenes */}
        <div>
           {project.chapters.map(chapter => (
            <div key={chapter.chapterIndex}>
                <button onClick={() => toggle(`ch-${chapter.chapterIndex}`)} className="w-full flex items-center justify-between text-sm font-semibold p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                    {chapter.title}
                    <ChevronRightIcon className={`w-4 h-4 transition-transform ${expanded[`ch-${chapter.chapterIndex}`] ? 'rotate-90' : ''}`} />
                </button>
                {expanded[`ch-${chapter.chapterIndex}`] && (
                    <div className="pl-2 space-y-1 mt-1">
                        {chapter.scenes.map((scene, sceneIndex) => (
                            <NavItem
                                key={sceneIndex}
                                label={`Scene ${sceneIndex + 1}`}
                                onClick={() => dispatch(setActiveContext({ type: 'scene', chapterId: chapter.chapterIndex, sceneId: sceneIndex }))}
                                isActive={activeContext.type === 'scene' && activeContext.chapterId === chapter.chapterIndex && activeContext.sceneId === sceneIndex}
                                icon={<div className="w-4 h-4 text-xs font-mono bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">{sceneIndex+1}</div>}
                                level={1}
                            />
                        ))}
                    </div>
                )}
            </div>
           ))}
        </div>

        <div className="pt-2 border-t border-gray-300 dark:border-gray-600 space-y-1">
            <h3 className="text-xs font-semibold uppercase text-gray-500 px-2 mt-2">Production</h3>
             <NavItem
              label="World Building"
              onClick={() => dispatch(setActiveContext({ type: 'world-characters' }))}
              isActive={activeContext.type.startsWith('world-')}
              icon={<SparklesIcon className="w-4 h-4" />}
            />
            {project.chapters.map(c => (
                 <NavItem
                  key={`layout-${c.chapterIndex}`}
                  label={`Layout: ${c.title}`}
                  onClick={() => dispatch(setActiveContext({ type: 'page-layout', chapterId: c.chapterIndex }))}
                  isActive={activeContext.type === 'page-layout' && activeContext.chapterId === c.chapterIndex}
                  icon={<ScissorsIcon className="w-4 h-4" />}
                />
            ))}
        </div>

        {project.pages.length > 0 && (
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600 space-y-1">
                 <h3 className="text-xs font-semibold uppercase text-gray-500 px-2 mt-2">Generated Pages</h3>
                 <NavItem
                    key="comic-viewer"
                    label="Comic Viewer"
                    onClick={() => dispatch(setActiveContext({ type: 'comic-viewer' }))}
                    isActive={activeContext.type === 'comic-viewer'}
                    icon={<BookOpenIcon className="w-4 h-4" />}
                 />
                 {project.pages.map(page => (
                     <NavItem
                        key={page.pageNumber}
                        label={`Page ${page.pageNumber}`}
                        onClick={() => dispatch(setActiveContext({ type: 'page', id: page.pageNumber }))}
                        isActive={(activeContext.type === 'page' && activeContext.id === page.pageNumber) || (activeContext.type === 'panel' && activeContext.pageId === page.pageNumber)}
                        icon={<ImageIcon className="w-4 h-4" />}
                        level={1}
                     />
                 ))}
            </div>
        )}
      </nav>
    </div>
  );
};

export default ProjectNavigator;
