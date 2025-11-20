import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { PanelData } from '../../types';
import { useAppDispatch } from '../../app/hooks';
import { regeneratePanel } from '../../features/pageThunks';
import { XCircleIcon } from '../Icons';
import { getMediaBlob } from '../../services/db';

interface RegeneratePanelSimpleProps {
  panel: PanelData;
}

export const RegeneratePanelSimple: React.FC<RegeneratePanelSimpleProps> = ({ panel }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [prompt, setPrompt] = React.useState(panel.originalVisualPrompt);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPrompt(panel.originalVisualPrompt);
  }, [panel.originalVisualPrompt]);

  React.useEffect(() => {
    let objectUrl: string | undefined;
    const loadImage = async () => {
      if (panel.imageId) {
        const blob = await getMediaBlob(panel.imageId);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      }
    };
    loadImage();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [panel.imageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      await dispatch(
        regeneratePanel({ panelId: panel.id, newPrompt: prompt }),
      ).unwrap();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error.somethingWentWrong'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase text-gray-500">Panel Inspector</h3>
      <div className="w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Current panel image"
            className="rounded-md w-full object-contain"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <label
          htmlFor="visual-prompt-inspector"
          className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1"
        >
          {t('regenerateModal.promptLabel')}
        </label>
        <textarea
          id="visual-prompt-inspector"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={6}
        />
        {error && (
          <div className="mt-2 flex items-start gap-1 text-xs text-red-500 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700">
            <XCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <div className="mt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white transition-colors shadow hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                {t('regenerateModal.generatingButton')}
              </>
            ) : (
              t('regenerateModal.generateButton')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
