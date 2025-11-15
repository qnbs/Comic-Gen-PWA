
import React, { useState, useRef, useEffect } from 'react';
import type { Scene } from '../types';
import { BookOpenIcon, UndoIcon, RedoIcon, EditIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface SceneEditorCardProps {
  scene: Scene;
  onUpdate: (updatedScene: Scene) => void;
}

const SceneEditorCard: React.FC<SceneEditorCardProps> = ({ scene, onUpdate }) => {
  const { t } = useTranslation();
  const [editingChar, setEditingChar] = useState<{ index: number; name: string } | null>(null);
  const charInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingChar !== null) {
      charInputRef.current?.focus();
      charInputRef.current?.select();
    }
  }, [editingChar]);

  const handlePromptChange = (e: React.FocusEvent<HTMLDivElement>) => {
    onUpdate({ ...scene, visualPrompt: e.currentTarget.innerText });
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
      <p><span className="font-semibold text-gray-500 dark:text-gray-400">{t('scene.summary')}:</span> {scene.summary}</p>
      {scene.dialogue && <p><span className="font-semibold text-gray-500 dark:text-gray-400">{t('scene.dialogue')}:</span> "{scene.dialogue}"</p>}
      
      <div>
        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('scene.characters')}:</label>
        <div className="flex flex-wrap gap-2 items-center">
            {scene.characters.map((char, index) => (
                <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full">
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
                            <button onClick={() => setEditingChar({ index, name: char })} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <EditIcon className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>
            ))}
            {scene.characters.length === 0 && <span className="text-gray-500 italic">{t('common.none')}</span>}
        </div>
      </div>
      
      <div>
        <label htmlFor={`action-score-${scene.summary.slice(0, 10)}`} className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('scene.actionScore')}</label>
        <input
          id={`action-score-${scene.summary.slice(0, 10)}`}
          type="number"
          min="1"
          max="10"
          value={scene.actionScore}
          onChange={handleActionScoreChange}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor={`visual-prompt-${scene.summary.slice(0, 10)}`} className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('scene.visualPrompt')}</label>
        <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handlePromptChange}
            className="w-full min-h-[150px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
            {scene.visualPrompt}
        </div>
      </div>
    </div>
  );
};


interface SceneReviewProps {
  scenes: Scene[];
  onUpdate: (index: number, updatedScene: Scene) => void;
  onComplete: (scenes: Scene[]) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const SceneReview: React.FC<SceneReviewProps> = ({ scenes, onUpdate, onComplete, onUndo, onRedo, canUndo, canRedo }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
                <BookOpenIcon className="w-8 h-8"/>
                {t('scene.reviewTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('scene.reviewSubtitle')}</p>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            {scenes.map((scene, index) => (
                <div key={index}>
                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-2">{t('scene.title', { index: index + 1 })}</h3>
                    <SceneEditorCard 
                        scene={scene}
                        onUpdate={(updatedScene) => onUpdate(index, updatedScene)}
                    />
                </div>
            ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
                <button 
                  onClick={onUndo} 
                  disabled={!canUndo}
                  className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('common.undo')}
                >
                    <UndoIcon className="w-6 h-6"/>
                </button>
                <button 
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('common.redo')}
                >
                    <RedoIcon className="w-6 h-6"/>
                </button>
            </div>
            <button
                onClick={() => onComplete(scenes)}
                className="w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
            >
                {t('scene.continueToCharacter')}
            </button>
        </div>
    </div>
  );
};

export default SceneReview;