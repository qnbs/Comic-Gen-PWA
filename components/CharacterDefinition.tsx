import React from 'react';
import { SparklesIcon, UndoIcon, RedoIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  generateCharacterSheet,
  generateComic,
  undoCharacterChange,
  redoCharacterChange,
  updateCharacterDescription,
} from '../features/generationSlice';

const CharacterCard: React.FC<{ characterName: string }> = ({
  characterName,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    (
      state.generation.characterHistory[state.generation.characterHistoryIndex] ||
      []
    ).find((c) => c.name === characterName),
  );
  const { originalText } = useAppSelector((state) => state.generation);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!character) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(
        generateCharacterSheet({ characterName, context: originalText }),
      ).unwrap();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error.generateSheetFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (
    e: React.FocusEvent<HTMLTextAreaElement>,
  ) => {
    if (character) {
      dispatch(
        updateCharacterDescription({
          name: character.name,
          description: e.target.value,
        }),
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-4 border border-gray-300 dark:border-gray-700">
      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
        {character.name}
      </h3>
      <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
        {character.referenceImageUrl ? (
          <img
            src={character.referenceImageUrl}
            alt={`${t('character.referenceFor')} ${character.name}`}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {t('character.noImage')}
          </span>
        )}
      </div>
      <textarea
        defaultValue={character.description}
        onBlur={handleDescriptionChange}
        placeholder={t('character.descriptionPlaceholder')}
        className="w-full h-28 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        aria-label={`${t('character.descriptionFor')} ${character.name}`}
      />
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
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

const CharacterDefinition: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { characters, canUndoCharacter, canRedoCharacter } = useAppSelector(
    (state) => ({
      characters:
        state.generation.characterHistory[
          state.generation.characterHistoryIndex
        ] || [],
      canUndoCharacter: state.generation.characterHistoryIndex > 0,
      canRedoCharacter:
        state.generation.characterHistoryIndex <
        state.generation.characterHistory.length - 1,
    }),
  );

  const allCharactersDefined = characters.every((c) => c.referenceImageUrl);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8" />
          {t('character.defineTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('character.defineSubtitle')}
        </p>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <CharacterCard key={char.name} characterName={char.name} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {t('character.noneDetected')}
        </p>
      )}

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(undoCharacterChange())}
            disabled={!canUndoCharacter}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('common.undo')}
          >
            <UndoIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => dispatch(redoCharacterChange())}
            disabled={!canRedoCharacter}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('common.redo')}
          >
            <RedoIcon className="w-6 h-6" />
          </button>
        </div>
        <button
          onClick={() => dispatch(generateComic())}
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
