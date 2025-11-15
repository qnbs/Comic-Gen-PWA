import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (lang: 'en' | 'de') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800/50 p-1 rounded-full border border-gray-300 dark:border-gray-700">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded-full transition-colors ${
          language === 'en'
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to English"
        title="English"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 30"
          width="24"
          height="12"
        >
          <clipPath id="a">
            <path d="M0 0v30h60V0z" />
          </clipPath>
          <clipPath id="b">
            <path d="M0 0v30h60V0z" />
          </clipPath>
          <g clip-path="url(#a)">
            <path d="M0 0v30h60V0z" fill="#012169" />
            <path
              d="M0 0L60 30m-60 0L60 0"
              stroke="#fff"
              stroke-width="6"
            />
            <path
              d="M0 0L60 30m-60 0L60 0"
              stroke="#c8102e"
              stroke-width="4"
            />
            <path
              d="M-1-1v4l-1 2-2 1h-4v4l-1 2v4h4l2 1 1 2v4l1-2 2-1h4v-4l1-2V9h-4l-2-1-1-2z"
              fill="#fff"
            />
            <g clip-path="url(#b)">
              <path
                d="M30 0v30M0 15h60"
                stroke="#fff"
                stroke-width="10"
              />
              <path
                d="M30 0v30M0 15h60"
                stroke="#c8102e"
                stroke-width="6"
              />
            </g>
          </g>
        </svg>
      </button>
      <button
        onClick={() => handleLanguageChange('de')}
        className={`px-2 py-1 rounded-full transition-colors ${
          language === 'de'
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to German"
        title="Deutsch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 5 3"
          width="24"
          height="14.4"
        >
          <path d="M0 0h5v3H0z" />
          <path d="M0 1h5v2H0z" fill="#D00" />
          <path d="M0 2h5v1H0z" fill="#FFCE00" />
        </svg>
      </button>
    </div>
  );
};

export default LanguageSelector;
