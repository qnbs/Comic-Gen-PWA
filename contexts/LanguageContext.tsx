import React from 'react';
import { translations, TranslationKeys, en } from '../services/translations';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setLanguage as setLanguageAction } from '../features/uiSlice';

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
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);

  const setLanguage = React.useCallback(
    (lang: Language) => {
      dispatch(setLanguageAction(lang));
    },
    [dispatch],
  );

  const t = React.useCallback(
    (
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
        return Object.entries(replacements).reduce(
          (acc, [placeholder, value]) => {
            return acc.replace(`{{${placeholder}}}`, String(value));
          },
          result,
        );
      }

      return result;
    },
    [language],
  );

  const value = React.useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
