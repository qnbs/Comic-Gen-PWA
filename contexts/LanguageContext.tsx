import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { translations, TranslationKeys } from '../services/translations';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys, replacements?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const getInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('comic-gen-lang');
    if (savedLang === 'en' || savedLang === 'de') {
        return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de') {
        return 'de';
    }
    return 'en';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('comic-gen-lang', lang);
    setLanguageState(lang);
  };

  const t = (key: TranslationKeys, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        if (fallbackResult === undefined) {
            return key; // Return key if not found anywhere
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result === 'string' && replacements) {
        return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
            return acc.replace(`{{${placeholder}}}`, String(value));
        }, result);
    }

    return typeof result === 'string' ? result : key;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
