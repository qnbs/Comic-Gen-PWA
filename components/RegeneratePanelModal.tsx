import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { PanelData } from '../types';

interface RegeneratePanelModalProps {
  panel: PanelData;
  onClose: () => void;
  onRegenerate: (newPrompt: string) => void;
}

const RegeneratePanelModal: React.FC<RegeneratePanelModalProps> = ({
  panel,
  onClose,
  onRegenerate,
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = React.useState(panel.originalVisualPrompt);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    onRegenerate(prompt);
    // The parent component will handle closing the modal upon completion
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
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
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex-shrink-0">
            <img
              src={panel.imageUrl}
              alt="Current panel image"
              className="rounded-md w-full object-contain"
            />
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
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2 bg-indigo-600 rounded-lg font-bold text-white transition-colors shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default RegeneratePanelModal;
