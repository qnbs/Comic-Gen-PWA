import React from 'react';
import { SparklesIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  generatePropSheet,
  updatePropDescription,
} from '../features/generationSlice';
import { WorldAsset } from '../types';

const PropCard: React.FC<{ prop: WorldAsset }> = ({ prop }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { originalFullText } = useAppSelector((state) => state.generation.project ?? {});
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!originalFullText) {
        throw new Error("Project text not found.");
      }
      await dispatch(
        generatePropSheet({ propName: prop.name, context: originalFullText }),
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

  const handleDescriptionChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    dispatch(updatePropDescription({ name: prop.name, description: e.target.value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-4 border border-gray-300 dark:border-gray-700">
      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
        {prop.name}
      </h3>
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
        {prop.referenceImageUrl ? (
          <img
            src={prop.referenceImageUrl}
            alt={`${t('prop.referenceFor')} ${prop.name}`}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {t('character.noImage')}
          </span>
        )}
      </div>
      <textarea
        defaultValue={prop.description}
        onBlur={handleDescriptionChange}
        placeholder={t('prop.descriptionPlaceholder')}
        className="w-full h-28 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        aria-label={`${t('prop.descriptionFor')} ${prop.name}`}
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
          t('prop.generateAppearance')
        )}
      </button>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

const PropDefinition: React.FC<{ onProceed: () => void }> = ({ onProceed }) => {
  const { t } = useTranslation();
  const { props } = useAppSelector(
    (state) => state.generation.project?.worldDB || { props: [] }
  );

  const allPropsDefined = props.every((p) => p.referenceImageUrl && p.description);

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8" />
          {t('prop.defineTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('prop.defineSubtitle')}
        </p>
      </div>

      {props.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((prop) => (
            <PropCard key={prop.name} prop={prop} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No key props detected.
        </p>
      )}

      <div className="mt-10 flex justify-end">
        <button
          onClick={onProceed}
          disabled={!allPropsDefined && props.length > 0}
          className="py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
          title={!allPropsDefined ? "Define all props before proceeding" : ""}
        >
          {t('worldBuilding.proceed')}
        </button>
      </div>
    </div>
  );
};

export default PropDefinition;
