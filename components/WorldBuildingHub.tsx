import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch } from '../app/hooks';
import { setGenerationStep } from '../features/generationSlice';
import { ProjectGenerationState } from '../types';
import CharacterDefinition from './CharacterDefinition';
import LocationDefinition from './LocationDefinition';
import PropDefinition from './PropDefinition';
import { SparklesIcon } from './Icons';

type WorldBuildingTab = 'characters' | 'locations' | 'props';

const WorldBuildingHub: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = React.useState<WorldBuildingTab>('characters');

  const handleProceed = () => {
    dispatch(setGenerationStep(ProjectGenerationState.PAGE_LAYOUT));
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8" />
          {t('worldBuilding.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('worldBuilding.subtitle')}
        </p>
      </div>

      <div className="mb-6 flex justify-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <button
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'characters'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {t('worldBuilding.tabCharacters')}
        </button>
        <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'locations'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {t('worldBuilding.tabLocations')}
        </button>
        <button
            onClick={() => setActiveTab('props')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'props'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {t('worldBuilding.tabProps')}
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'characters' && <CharacterDefinition onProceed={handleProceed} />}
        {activeTab === 'locations' && <LocationDefinition onProceed={handleProceed} />}
        {activeTab === 'props' && <PropDefinition onProceed={handleProceed} />}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <button
            onClick={() => dispatch(setGenerationStep(ProjectGenerationState.DONE))}
            className="py-2 px-6 bg-gray-500 rounded-lg font-semibold text-white shadow-lg hover:bg-gray-600"
        >
            Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WorldBuildingHub;
