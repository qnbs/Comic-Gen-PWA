import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ProjectGenerationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { resetProject } from '../features/projectSlice';

const ProjectImporter = React.lazy(() => import('./ProjectImporter'));
const MainWorkspace = React.lazy(() => import('./MainWorkspace'));

const CreatorWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { status, error, project } = useAppSelector(
    (state) => state.project.present,
  );

  const renderContent = () => {
    switch (status) {
      case ProjectGenerationState.PROJECT_SETUP:
        return (
          <React.Suspense fallback={<Loader state={ProjectGenerationState.PROJECT_SETUP} />}>
            <ProjectImporter />
          </React.Suspense>
        );

      case ProjectGenerationState.GLOBAL_ANALYSIS:
      case ProjectGenerationState.GENERATING_PAGES:
        return <Loader state={status} />;

      case ProjectGenerationState.ERROR:
        return (
          <ErrorDisplay
            title={t('error.generationFailed')}
            message={error || t('error.somethingWentWrong')}
            onRetry={() => dispatch(resetProject())}
            retryText={t('common.tryAgain')}
          />
        );

      case ProjectGenerationState.DONE:
      default:
        return project ? (
          <React.Suspense fallback={<Loader state={ProjectGenerationState.DONE} />}>
            <MainWorkspace />
          </React.Suspense>
        ) : (
          <React.Suspense fallback={<Loader state={ProjectGenerationState.PROJECT_SETUP} />}>
            <ProjectImporter />
          </React.Suspense>
        );
    }
  };

  return (
    <div className="w-full h-full max-w-full flex flex-col items-center">
      {renderContent()}
    </div>
  );
};

export default CreatorWorkspace;