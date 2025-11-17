import React from 'react';
import { ProjectGenerationState } from '../types';
import { BookOpenIcon, ImageIcon, WandIcon, ScissorsIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface LoaderProps {
  state: ProjectGenerationState;
}

const Loader: React.FC<LoaderProps> = ({ state }) => {
  const { t } = useTranslation();

  const loadingInfo = React.useMemo(() => {
    switch (state) {
      case ProjectGenerationState.GLOBAL_ANALYSIS:
        return {
          icon: <BookOpenIcon className="w-12 h-12" />,
          text: t('loader.analyzingText'),
          description: t('loader.analyzingTextDesc'),
        };
      case ProjectGenerationState.GENERATING_PAGES:
        return {
          icon: <ImageIcon className="w-12 h-12" />,
          text: t('loader.generatingImages'),
          description: t('loader.generatingImagesDesc'),
        };
      case ProjectGenerationState.WORLD_BUILDING:
         return {
          icon: <WandIcon className="w-12 h-12" />,
          text: 'Building Your World...',
          description: 'Establishing visual consistency for characters and locations. This ensures they look the same in every panel.',
        };
      case ProjectGenerationState.PAGE_LAYOUT:
        return {
          icon: <ScissorsIcon className="w-12 h-12" />,
          text: 'Designing Page Layout...',
          description: 'Calculating the optimal size and position for each panel based on its action score.',
        };
      default:
        return {
          icon: null,
          text: t('loader.loading'),
          description: t('loader.pleaseWait'),
        };
    }
  }, [state, t]);

  return (
    <div
      className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700"
      role="alert"
      aria-live="assertive"
    >
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-50"></div>
        <div className="relative text-indigo-500 dark:text-indigo-300">
          {loadingInfo.icon}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {loadingInfo.text}
      </h2>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400 max-w-sm">
        {loadingInfo.description}
      </p>
    </div>
  );
};

export default Loader;