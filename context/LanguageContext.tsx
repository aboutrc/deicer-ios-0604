import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18n } from 'i18n-js';
import { en, es } from '@/translations';

// Create a new I18n instance
const i18n = new I18n({ en, es });
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

type LanguageCode = 'en' | 'es';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: string) => void;
  t: (key: string, options?: I18n.TranslateOptions) => string;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update locale when language changes
  const setLanguage = (lang: string) => {
    if (lang === 'en' || lang === 'es') {
      setLanguageState(lang);
      i18n.locale = lang;
    }
  };

  // Create a memoized translation function
  const t = (key: string, options?: I18n.TranslateOptions): string => {
    return i18n.t(key, { ...options, defaultValue: key });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
};