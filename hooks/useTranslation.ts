import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};