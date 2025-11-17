import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { generatePageFromScenes, setGenerationStep } from '../features/generationSlice';
import { ProjectGenerationState } from '../types';
import { Wand2Icon } from './Icons';

const PageLayoutEditor: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { project, activeChapterIndex } = useAppSelector((state) => state.generation);
  const [selectedSceneIndices, setSelectedSceneIndices] = React.useState<number[]>([]);

  if (!project || activeChapterIndex === null) {
    return <div>Error: No active chapter selected.</div>;
  }

  const activeChapter = project.chapters[activeChapterIndex];

  const handleSceneToggle = (index: number) => {
    setSelectedSceneIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleGeneratePage = () => {
    if (selectedSceneIndices.length === 0) return;
    dispatch(generatePageFromScenes({
      chapterIndex: activeChapterIndex,
      sceneIndices: selectedSceneIndices,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <Wand2Icon className="w-8 h-8" />
          {t('pageLayout.title')}
        </h2>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-2">{activeChapter.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('pageLayout.subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold mb-4">{t('pageLayout.selectScenes')}</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {activeChapter.scenes.length > 0 ? (
            activeChapter.scenes.map((scene, index) => (
              <div
                key={index}
                onClick={() => handleSceneToggle(index)}
                className={`p-3 rounded-md cursor-pointer transition-colors border-2 ${
                  selectedSceneIndices.includes(index)
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={selectedSceneIndices.includes(index)}
                        readOnly
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{t('scene.title', { index: index + 1 })}: {scene.summary}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scene.originalText.substring(0, 200)}...</p>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">{t('pageLayout.noScenes')}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
            onClick={() => dispatch(setGenerationStep(ProjectGenerationState.DONE))}
            className="py-3 px-6 bg-gray-500 rounded-lg text-lg font-bold text-white shadow-lg hover:bg-gray-600"
        >
            Back to Dashboard
        </button>
        <button
          onClick={handleGeneratePage}
          disabled={selectedSceneIndices.length === 0}
          className="py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {t('pageLayout.generatePage', { count: selectedSceneIndices.length })}
        </button>
      </div>
    </div>
  );
};

export default PageLayoutEditor;
