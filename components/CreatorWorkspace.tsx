import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ProjectGenerationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { resetApp } from '../features/generationSlice';
import ProjectImporter from './ProjectImporter';
import ProjectDashboard from './ProjectDashboard';
import ChapterReview from './ChapterReview';
import WorldBuildingHub from './WorldBuildingHub';
import PageLayoutEditor from './PageLayoutEditor';
import ComicViewer from './ComicViewer';

const CreatorWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { generationState, error, project, activeChapterIndex } = useAppSelector(
    (state) => state.generation,
  );

  const renderContent = () => {
    switch (generationState) {
      case ProjectGenerationState.PROJECT_SETUP:
        return <ProjectImporter />;

      case ProjectGenerationState.CHAPTER_REVIEW:
        if (project && activeChapterIndex !== null) {
          const chapter = project.chapters[activeChapterIndex];
          if (chapter) {
            return <ChapterReview chapter={chapter} />;
          }
        }
        return <ProjectDashboard />; // Fallback to dashboard
      
      case ProjectGenerationState.WORLD_BUILDING:
        return <WorldBuildingHub />;

      case ProjectGenerationState.PAGE_LAYOUT:
         if (project && activeChapterIndex !== null) {
            return <PageLayoutEditor />;
         }
         return <ProjectDashboard />;
        
      case ProjectGenerationState.VIEWING_PAGES:
        return <ComicViewer />;

      case ProjectGenerationState.DONE:
        return <ProjectDashboard />;

      case ProjectGenerationState.ERROR:
        return (
          <ErrorDisplay
            title={t('error.generationFailed')}
            message={error || t('error.somethingWentWrong')}
            onRetry={() => dispatch(resetApp())}
            retryText={t('common.tryAgain')}
          />
        );
      
      case ProjectGenerationState.GLOBAL_ANALYSIS:
      case ProjectGenerationState.GENERATING_PAGES:
         return <Loader state={generationState} />;
      
      default:
        return project ? <ProjectDashboard /> : <ProjectImporter />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {renderContent()}
    </div>
  );
};

export default CreatorWorkspace;