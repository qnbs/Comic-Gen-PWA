import React from 'react';
import type { Scene, Chapter } from '../types';
import { BookOpenIcon, EditIcon, SaveIcon, XIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch } from '../app/hooks';
import { setGenerationStep, updateScene } from '../features/generationSlice';
import { ProjectGenerationState } from '../types';

const EditableSceneCard: React.FC<{
  scene: Scene;
  sceneNumber: number;
  chapterIndex: number;
}> = ({ scene, sceneNumber, chapterIndex }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableScene, setEditableScene] = React.useState<Scene>(scene);

  const handleEditToggle = () => {
    if (isEditing) {
      // If cancelling, revert changes
      setEditableScene(scene);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    dispatch(
      updateScene({
        chapterIndex,
        sceneIndex: sceneNumber - 1,
        updatedScene: editableScene,
      }),
    );
    setIsEditing(false);
  };

  const handleChange = (
    field: keyof Scene,
    value: string | number | string[],
  ) => {
    setEditableScene((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700 space-y-3 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-indigo-600 dark:text-indigo-300">
          {t('scene.title', { index: sceneNumber })}
        </h4>
        <div className="flex gap-2">
          {isEditing && (
             <button
              onClick={handleSave}
              className="p-1.5 text-green-600 dark:text-green-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={t('common.save')}
            >
              <SaveIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleEditToggle}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={isEditing ? t('common.cancel') : t('common.edit')}
          >
            {isEditing ? <XIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
           <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('scene.summary')}</label>
                <input type="text" value={editableScene.summary} onChange={(e) => handleChange('summary', e.target.value)} className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500"/>
           </div>
           <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('scene.dialogue')}</label>
                <textarea value={editableScene.dialogue} onChange={(e) => handleChange('dialogue', e.target.value)} className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500" rows={2}/>
           </div>
           <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('scene.characters')}</label>
                <input type="text" value={editableScene.characters.join(', ')} onChange={(e) => handleChange('characters', e.target.value.split(',').map(c => c.trim()))} className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500"/>
           </div>
            <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('scene.visualPrompt')}</label>
                <textarea value={editableScene.visualPrompt} onChange={(e) => handleChange('visualPrompt', e.target.value)} className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500" rows={4}/>
           </div>
        </div>
      ) : (
         <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">{t('scene.summary')}:</span> {scene.summary}</p>
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">{t('scene.characters')}:</span> {scene.characters.join(', ') || 'None'}</p>
            <p className="text-xs italic bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md text-gray-600 dark:text-gray-300">{scene.visualPrompt}</p>
         </div>
      )}
    </div>
  );
};

interface ChapterReviewProps {
  chapter: Chapter;
}

const ChapterReview: React.FC<ChapterReviewProps> = ({ chapter }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <BookOpenIcon className="w-8 h-8" />
          {t('scene.reviewTitle')}
        </h2>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-2">
          {chapter.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          {t('scene.reviewSubtitle')}
        </p>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
        {chapter.scenes.map((scene, index) => (
          <EditableSceneCard
            key={index}
            scene={scene}
            sceneNumber={index + 1}
            chapterIndex={chapter.chapterIndex}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => dispatch(setGenerationStep(ProjectGenerationState.DONE))}
          className="w-full sm:w-auto py-3 px-6 bg-gray-500 rounded-lg text-lg font-bold text-white shadow-lg hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => dispatch(setGenerationStep(ProjectGenerationState.WORLD_BUILDING))}
          className="w-full sm:w-auto py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 transform hover:scale-105"
        >
          {t('scene.continueToCharacter')}
        </button>
      </div>
    </div>
  );
};

export default ChapterReview;
