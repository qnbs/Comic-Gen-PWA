import React from 'react';
import type { Scene } from '../types';
import { BookOpenIcon, UndoIcon, RedoIcon, EditIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  updateScene,
  scenesReviewed,
  undoSceneChange,
  redoSceneChange,
} from '../features/generationSlice';

interface SceneEditorCardProps {
  scene: Scene;
  onUpdate: (updatedScene: Scene) => void;
}

const SceneEditorCard: React.FC<SceneEditorCardProps> = ({
  scene,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [editingChar, setEditingChar] = React.useState<{
    index: number;
    name: string;
  } | null>(null);
  const charInputRef = React.useRef<HTMLInputElement>(null);
  const [internalVisualPrompt, setInternalVisualPrompt] = React.useState(
    scene.visualPrompt,
  );

  React.useEffect(() => {
    if (editingChar !== null) {
      charInputRef.current?.focus();
      charInputRef.current?.select();
    }
  }, [editingChar]);

  React.useEffect(() => {
    setInternalVisualPrompt(scene.visualPrompt);
  }, [scene.visualPrompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalVisualPrompt(e.target.value);
  };

  const handlePromptBlur = () => {
    if (internalVisualPrompt !== scene.visualPrompt) {
      onUpdate({ ...scene, visualPrompt: internalVisualPrompt });
    }
  };

  const handleActionScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = parseInt(e.target.value, 10);
    if (!isNaN(score) && score >= 1 && score <= 10) {
      onUpdate({ ...scene, actionScore: score });
    }
  };

  const handleCharNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingChar) {
      setEditingChar({ ...editingChar, name: e.target.value });
    }
  };

  const saveCharName = () => {
    if (editingChar) {
      const newCharacters = [...scene.characters];
      newCharacters[editingChar.index] = editingChar.name;
      onUpdate({ ...scene, characters: newCharacters });
      setEditingChar(null);
    }
  };

  const handleCharInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveCharName();
    }
    if (e.key === 'Escape') {
      setEditingChar(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700 space-y-3">
      <p>
        <span className="font-semibold text-gray-500 dark:text-gray-400">
          {t('scene.summary')}:
        </span>{' '}
        {scene.summary}
      </p>
      {scene.dialogue && (
        <p>
          <span className="font-semibold text-gray-500 dark:text-gray-400">
            {t('scene.dialogue')}:
          </span>{' '}
          "{scene.dialogue}"
        </p>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
          {t('scene.characters')}:
        </label>
        <div className="flex flex-wrap gap-2 items-center">
          {scene.characters.map((char, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              {editingChar?.index === index ? (
                <input
                  ref={charInputRef}
                  type="text"
                  value={editingChar.name}
                  onChange={handleCharNameChange}
                  onBlur={saveCharName}
                  onKeyDown={handleCharInputKeyDown}
                  className="bg-transparent px-3 py-1 focus:outline-none"
                />
              ) : (
                <>
                  <span className="px-3 py-1">{char}</span>
                  <button
                    onClick={() => setEditingChar({ index, name: char })}
                    className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label={`${t('common.edit')} ${char}`}
                  >
                    <EditIcon className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          ))}
          {scene.characters.length === 0 && (
            <span className="text-gray-500 italic">{t('common.none')}</span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`action-score-${scene.summary.slice(0, 10)}`}
          className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1"
        >
          {t('scene.actionScore')}
        </label>
        <div className="flex items-center gap-3">
          <input
            id={`action-score-${scene.summary.slice(0, 10)}`}
            type="range"
            min="1"
            max="10"
            step="1"
            value={scene.actionScore}
            onChange={handleActionScoreChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-mono p-1 bg-gray-100 dark:bg-gray-900 rounded-md w-12 text-center">
            {scene.actionScore}
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor={`visual-prompt-label-${scene.summary.slice(0, 10)}`}
          className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1"
        >
          {t('scene.visualPrompt')}
        </label>
        <textarea
          id={`visual-prompt-label-${scene.summary.slice(0, 10)}`}
          value={internalVisualPrompt}
          onChange={handlePromptChange}
          onBlur={handlePromptBlur}
          rows={6}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-multiline="true"
          aria-labelledby={`visual-prompt-label-${scene.summary.slice(0, 10)}`}
        />
        <p
          className={`text-xs text-right mt-1 ${
            internalVisualPrompt.length > 1000
              ? 'text-red-500'
              : 'text-gray-500'
          }`}
        >
          {internalVisualPrompt.length} / 1000
        </p>
      </div>
    </div>
  );
};

const SceneReview: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { scenes, canUndoScene, canRedoScene } = useAppSelector((state) => ({
    scenes:
      state.generation.sceneHistory[state.generation.sceneHistoryIndex] || [],
    canUndoScene: state.generation.sceneHistoryIndex > 0,
    canRedoScene:
      state.generation.sceneHistoryIndex <
      state.generation.sceneHistory.length - 1,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <BookOpenIcon className="w-8 h-8" />
          {t('scene.reviewTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('scene.reviewSubtitle')}
        </p>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
        {scenes.map((scene, index) => (
          <div key={index}>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-2">
              {t('scene.title', { index: index + 1 })}
            </h3>
            <SceneEditorCard
              scene={scene}
              onUpdate={(updatedScene) =>
                dispatch(updateScene({ index, updatedScene }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(undoSceneChange())}
            disabled={!canUndoScene}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('common.undo')}
          >
            <UndoIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => dispatch(redoSceneChange())}
            disabled={!canRedoScene}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('common.redo')}
          >
            <RedoIcon className="w-6 h-6" />
          </button>
        </div>
        <button
          onClick={() => dispatch(scenesReviewed(scenes))}
          className="w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
        >
          {t('scene.continueToCharacter')}
        </button>
      </div>
    </div>
  );
};

export default SceneReview;
