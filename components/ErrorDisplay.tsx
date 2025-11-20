import React from 'react';
import { XCircleIcon } from './Icons';

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <div
      className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-6 rounded-r-lg shadow-md max-w-2xl mx-auto"
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <XCircleIcon className="w-8 h-8 text-red-500 mr-4" />
        </div>
        <div>
          <p className="font-bold text-xl">{title}</p>
          <p className="text-md mt-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-colors"
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorDisplay);