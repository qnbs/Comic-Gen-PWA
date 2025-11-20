import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ProjectGenerationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { resetProject } from '../features/projectSlice';
import ProjectImporter from './ProjectImporter';
import MainWorkspace from './MainWorkspace';

const CreatorWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { status, error, project } = useAppSelector(
    (state) => state.project.present,
  );

  const renderContent = () => {
    switch (status) {
      case ProjectGenerationState.PROJECT_SETUP:
        return <ProjectImporter />;

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
        return project ? <MainWorkspace /> : <ProjectImporter />;
    }
  };

  return (
    <div className="w-full h-full max-w-full flex flex-col items-center">
      {renderContent()}
    </div>
  );
};

export default CreatorWorkspace;