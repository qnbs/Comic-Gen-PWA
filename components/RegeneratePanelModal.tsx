import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { PanelData } from '../types';
import { useAppDispatch, useFocusTrap } from '../app/hooks';
import { regeneratePanel } from '../features/pageThunks';
import { XCircleIcon, XIcon } from './Icons';
import { getMediaBlob } from '../services/db';

interface RegeneratePanelModalProps {
  panel: PanelData;
  onClose: () => void;
  onSuccess: () => void;
}

const RegeneratePanelModal: React.FC<RegeneratePanelModalProps> = ({
  panel,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [prompt, setPrompt] = React.useState(panel.originalVisualPrompt);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, true, onClose);

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
      onSuccess();
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
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
            {t('regenerateModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex-shrink-0">
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
              htmlFor="visual-prompt-editor"
              className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1"
            >
              {t('regenerateModal.promptLabel')}
            </label>
            <textarea
              id="visual-prompt-editor"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={8}
            />
            <p
              className={`text-xs text-right mt-1 ${
                prompt.length > 1000 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {prompt.length} / 1000
            </p>
            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700">
                <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 bg-indigo-600 rounded-lg font-bold text-white transition-colors shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    {t('regenerateModal.generatingButton')}
                  </>
                ) : (
                  t('regenerateModal.generateButton')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RegeneratePanelModal);