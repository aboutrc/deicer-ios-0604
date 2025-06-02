import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18n } from 'i18n-js';
import { en, es } from '@/translations';
import { zh, hi, ar } from '@/translations';

// Create a new I18n instance
const i18n = new I18n({ en, es, zh, hi, ar });
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

type LanguageCode = 'en' | 'es' | 'zh' | 'hi' | 'ar';

export interface AgentConfig {
  id: string;
  image: any;
}

const agentConfigs: Record<LanguageCode, AgentConfig> = {
  en: { id: 'nPjA5PlVWxRd7L1Ypou4', image: require('@/assets/images/tia_lupe_w.jpg') },
  es: { id: 'nPjA5PlVWxRd7L1Ypou4', image: require('@/assets/images/tia_lupe_w.jpg') },
  zh: { id: 'pum6281czPCDQE9zKIZA', image: require('@/assets/images/zh-chtbot.jpg') },
  hi: { id: 'AdbXj7fLA3RE0roiYR7c', image: require('@/assets/images/hi-chtbot.jpg') },
  ar: { id: 'pum6281czPCDQE9zKIZA', image: require('@/assets/images/ar-chtbot.jpg') }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: string) => void;
  t: (key: string, options?: I18n.TranslateOptions) => string;
  isInitialized: boolean;
  currentAgent: AgentConfig;
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
  const [currentAgent, setCurrentAgent] = useState<AgentConfig>(agentConfigs.en);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update locale when language changes
  const setLanguage = (lang: string) => {
    if (lang in agentConfigs) {
      setLanguageState(lang);
      i18n.locale = lang;
      setCurrentAgent(agentConfigs[lang as LanguageCode]);
    }
  };

  // Create a memoized translation function
  const t = (key: string, options?: I18n.TranslateOptions): string => {
    return i18n.t(key, { ...options, defaultValue: key });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isInitialized, currentAgent }}>
      {children}
    </LanguageContext.Provider>
  );
};