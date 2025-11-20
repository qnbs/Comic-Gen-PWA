import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { WorldAsset, Character } from '../types';
import { TranslationKeys } from '../services/translations';
import PoseLibrary from './PoseLibrary';
import { getMediaBlob } from '../services/db';
import { WandIcon } from './Icons';

interface WorldAssetCardProps {
  asset: WorldAsset | Character;
  assetType: 'character' | 'location' | 'prop';
  onDescriptionChange: (name: string, description: string) => void;
  onGenerate: () => Promise<unknown>;
}

const WorldAssetCard: React.FC<WorldAssetCardProps> = React.memo(({
  asset,
  assetType,
  onDescriptionChange,
  onGenerate,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let objectUrl: string | undefined;
    const loadImage = async () => {
      if (asset.referenceImageId) {
        const blob = await getMediaBlob(asset.referenceImageId);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } else {
        setImageUrl(null);
      }
    };
    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [asset.referenceImageId]);

  const handleGenerateClick = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onGenerate();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error.generateSheetFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [onGenerate, t]);

  const handleDescriptionBlur = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(asset.name, e.target.value);
  }, [onDescriptionChange, asset.name]);

  const aspectRatioClass = assetType === 'location' ? 'aspect-video' : 'aspect-square';
  const generateText = t(`${assetType}.generateAppearance` as TranslationKeys);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-6 hover:-translate-y-1">
      <div className="flex justify-between items-center">
           <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate pr-4">
            {asset.name}
          </h3>
          <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600`}>
              {assetType}
          </div>
      </div>
     
      {/* Image Frame - styled like a concept art card */}
      <div className={`w-full ${aspectRatioClass} bg-gray-100 dark:bg-gray-900 rounded-2xl border-4 border-white dark:border-gray-700 shadow-inner overflow-hidden relative group`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${t(`${assetType}.referenceFor` as TranslationKeys)} ${asset.name}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
             <WandIcon className="w-10 h-10 mb-3 opacity-30" />
            <span className="text-xs font-medium opacity-50">
              {t('character.noImage')}
            </span>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-3 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mb-2"></div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">{t('common.generating')}</span>
            </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
             {t(`${assetType}.descriptionFor` as TranslationKeys)}
        </label>
        <textarea
            defaultValue={asset.description}
            onBlur={handleDescriptionBlur}
            placeholder={t(`${assetType}.descriptionPlaceholder` as TranslationKeys)}
            className="w-full h-32 bg-gray-50 dark:bg-gray-900/50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all rounded-2xl p-4 text-sm outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      <button
        onClick={handleGenerateClick}
        disabled={isLoading}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? t('common.generating') : generateText}
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl text-xs text-red-600 dark:text-red-400 leading-relaxed">
            {error}
        </div>
      )}
      
      {assetType === 'character' && (
        <PoseLibrary character={asset as Character} />
      )}
    </div>
  );
});

export default WorldAssetCard;