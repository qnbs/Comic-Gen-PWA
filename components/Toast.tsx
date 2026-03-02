import React from 'react';
import { useAppDispatch } from '../app/hooks';
import { removeToast } from '../features/uiSlice';
import type { Toast as ToastType } from '../features/uiSlice';
import { CheckCircleIcon, XCircleIcon, XIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

const Toast: React.FC<ToastType> = ({ id, message, type }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, dispatch]);

  const toastStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/50',
      border: 'border-green-400 dark:border-green-600',
      iconColor: 'text-green-500 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/50',
      border: 'border-red-400 dark:border-red-600',
      iconColor: 'text-red-500 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-200',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/50',
      border: 'border-blue-400 dark:border-blue-600',
      iconColor: 'text-blue-500 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
  };

  const styles = toastStyles[type];

  return (
    <div
      className={`max-w-sm w-full ${styles.bg} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${styles.border}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' && <CheckCircleIcon className={`w-6 h-6 ${styles.iconColor}`} />}
            {type === 'error' && <XCircleIcon className={`w-6 h-6 ${styles.iconColor}`} />}
            {type === 'info' && <CheckCircleIcon className={`w-6 h-6 ${styles.iconColor}`} />}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${styles.textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => dispatch(removeToast(id))}
              className={`inline-flex rounded-md p-1 ${styles.textColor} hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <span className="sr-only">{t('common.close')}</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Toast);