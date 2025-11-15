import React, { useState } from 'react';
import type { Character } from '../types';
import { generateCharacterSheet } from '../services/geminiService';
import { SparklesIcon, UndoIcon, RedoIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface CharacterDefinitionProps {
  characters: Character[];
  bookText: string;
  onCharacterSheetGenerated: (characterName: string, description: string, imageUrl: string) => void;
  onComplete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CharacterCard: React.FC<{
  character: Character;
  bookText: string;
  onSheetGenerated: (name: string, description: string, imageUrl: string) => void;
}> = ({ character, bookText, onSheetGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { description, imageUrl } = await generateCharacterSheet(character.name, bookText);
      onSheetGenerated(character.name, description, imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generateSheetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-4 border border-gray-300 dark:border-gray-700">
      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{character.name}</h3>
      <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
        {character.referenceImageUrl ? (
          <img src={character.referenceImageUrl} alt={`${t('character.referenceFor')} ${character.name}`} className="w-full h-full object-cover rounded-md" />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{t('character.noImage')}</span>
        )}
      </div>
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-purple-600 rounded-lg font-semibold text-white transition-colors hover:bg-purple-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            {t('common.generating')}
          </>
        ) : (
          t('character.generateAppearance')
        )}
      </button>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

const CharacterDefinition: React.FC<CharacterDefinitionProps> = ({ characters, bookText, onCharacterSheetGenerated, onComplete, onUndo, onRedo, canUndo, canRedo }) => {
    const { t } = useTranslation();
    const allCharactersDefined = characters.every(c => c.referenceImageUrl);
  
    return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8"/>
          {t('character.defineTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('character.defineSubtitle')}</p>
      </div>
      
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map(char => (
            <CharacterCard 
                key={char.name} 
                character={char} 
                bookText={bookText}
                onSheetGenerated={onCharacterSheetGenerated} 
            />
            ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">{t('character.noneDetected')}</p>
      )}

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
            onClick={onComplete}
            disabled={!allCharactersDefined && characters.length > 0}
            className="w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
        >
            {t('character.proceed')}
        </button>
      </div>
    </div>
  );
};

export default CharacterDefinition;