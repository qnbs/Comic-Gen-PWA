import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useTranslation } from '../hooks/useTranslation';
import { BookOpenIcon, SparklesIcon, Wand2Icon, ChevronRightIcon, ImageIcon } from './Icons';
import { setActiveChapter, setGenerationStep } from '../features/generationSlice';
import { ProjectGenerationState } from '../types';

const PageThumbnail: React.FC<{ pageNumber: number, imageUrl?: string }> = ({ pageNumber, imageUrl }) => {
    return (
        <div className="flex-shrink-0 w-24 text-center">
            <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                {imageUrl ? (
                    <img src={imageUrl} alt={`Page ${pageNumber}`} className="w-full h-full object-cover"/>
                ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                )}
            </div>
            <p className="text-xs mt-1 font-semibold text-gray-600 dark:text-gray-400">Page {pageNumber}</p>
        </div>
    );
};

const ProjectDashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { project, activeChapterIndex } = useAppSelector((state) => state.generation);

  if (!project) {
    return <div>Loading project...</div>;
  }

  const handleChapterSelect = (index: number) => {
    dispatch(setActiveChapter(index));
    dispatch(setGenerationStep(ProjectGenerationState.CHAPTER_REVIEW));
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {project.title}
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Project Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chapters Panel */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpenIcon className="w-5 h-5" /> Chapters</h3>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {project.chapters.map((chapter) => (
              <li key={chapter.chapterIndex}>
                <button
                  onClick={() => handleChapterSelect(chapter.chapterIndex)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex justify-between items-center ${
                    activeChapterIndex === chapter.chapterIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <span>{chapter.title}</span>
                  <ChevronRightIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Workspace Panel */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> World-Building Hub</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Define the core visual elements of your story for consistency across all pages.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => dispatch(setGenerationStep(ProjectGenerationState.WORLD_BUILDING))}
                  className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                >
                  Manage Visuals
                </button>
              </div>
          </div>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Wand2Icon className="w-5 h-5" /> Page Production</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Arrange scenes into pages and generate the final comic book. View your storyboard below.</p>
               <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg mb-4">
                    <div className="flex items-center gap-4 h-40 overflow-x-auto">
                        {project.pages.length > 0 ? project.pages.map(page => (
                           <PageThumbnail key={page.pageNumber} pageNumber={page.pageNumber} imageUrl={page.panels[0]?.imageUrl} />
                        )) : (
                            <div className="w-full text-center text-gray-500">No pages generated yet.</div>
                        )}
                    </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => dispatch(setGenerationStep(ProjectGenerationState.VIEWING_PAGES))} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={project.pages.length === 0}>
                        <div className="text-3xl font-bold">{project.pages.length}</div>
                        <div className="text-sm text-gray-500">View & Reorder Pages</div>
                   </button>
                   <button 
                    onClick={() => dispatch(setGenerationStep(ProjectGenerationState.PAGE_LAYOUT))}
                    className="bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={activeChapterIndex === null}
                    title={activeChapterIndex === null ? "Select a chapter first" : "Go to Page Layout"}
                  >
                        Layout New Page
                   </button>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
