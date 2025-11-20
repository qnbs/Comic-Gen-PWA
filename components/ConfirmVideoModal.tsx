import React from 'react';
import { VideoIcon, XIcon } from './Icons';
import { useFocusTrap } from '../app/hooks';

interface ConfirmVideoModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmVideoModal: React.FC<ConfirmVideoModalProps> = ({ onConfirm, onCancel }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true, onCancel);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center gap-2">
                <VideoIcon className="w-6 h-6" />
                Generate Video Panel
            </h3>
            <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
            This feature uses the Google Veo model to generate a short video. Please be aware:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <li>Video generation is a <span className="font-semibold">paid feature</span> and may incur costs on your API key.</li>
            <li>The process can take <span className="font-semibold">several minutes</span> to complete.</li>
            <li>For billing information, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</li>
        </ul>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
            Confirm & Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfirmVideoModal);
