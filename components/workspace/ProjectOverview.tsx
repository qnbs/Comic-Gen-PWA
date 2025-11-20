
import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { BookOpenIcon, SparklesIcon } from '../Icons';
import { setActiveContext } from '../../features/projectSlice';

const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
);

const ProjectOverview: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { project } = useAppSelector((state) => state.project.present);

  if (!project) {
    return <div>{t('loader.loading')}</div>;
  }

  const totalScenes = project.chapters.reduce((sum, chapter) => sum + chapter.scenes.length, 0);

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
          {project.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Project Overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard value={project.chapters.length} label={t('projectOverview.chapters')} />
          <StatCard value={totalScenes} label={t('projectOverview.totalScenes')} />
          <StatCard value={project.worldDB.characters.length} label={t('projectOverview.characters')} />
          <StatCard value={project.pages.length} label={t('projectOverview.pagesCreated')} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><SparklesIcon className="w-5 h-5"/> {t('projectOverview.getStarted')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => dispatch(setActiveContext({ type: 'world-characters' }))}
                className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-left hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                  <h4 className="font-semibold">{t('projectOverview.buildWorldTitle')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('projectOverview.buildWorldDesc')}</p>
              </button>
               <button 
                onClick={() => dispatch(setActiveContext({ type: 'page-layout', chapterId: 0 }))}
                className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-left hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                  <h4 className="font-semibold">{t('projectOverview.layoutPageTitle')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('projectOverview.layoutPageDesc')}</p>
              </button>
          </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
