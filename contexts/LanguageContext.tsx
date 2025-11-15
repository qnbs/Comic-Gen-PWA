import React from 'react';
import { translations, TranslationKeys, en } from '../services/translations';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (
    key: TranslationKeys,
    replacements?: { [key: string]: string | number },
  ) => string;
}

export const LanguageContext = React.createContext<
  LanguageContextType | undefined
>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
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

const getNestedValue = (
  obj: typeof en,
  keys: string[],
): string | undefined => {
  let current: unknown = obj;
  for (const key of keys) {
    if (
      typeof current !== 'object' ||
      current === null ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return undefined;
    }
    current = (current as { [key: string]: unknown })[key];
  }
  return typeof current === 'string' ? current : undefined;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] =
    React.useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('comic-gen-lang', lang);
    setLanguageState(lang);
  };

  const t = (
    key: TranslationKeys,
    replacements?: { [key: string]: string | number },
  ): string => {
    const keys = key.split('.');
    let result = getNestedValue(translations[language], keys);

    if (result === undefined) {
      // Fallback to English if translation is missing
      result = getNestedValue(translations.en, keys);
    }

    if (result === undefined) {
      return key; // Return key if not found anywhere
    }

    if (replacements) {
      return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
        return acc.replace(`{{${placeholder}}}`, String(value));
      }, result);
    }

    return result;
  };

  const value = React.useMemo(
    () => ({ language, setLanguage, t }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
