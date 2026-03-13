import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StorageService } from '@/services/storage/storage.service';

export type SupportedLanguage = 'en' | 'es';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<SupportedLanguage>(
    (i18n.language?.substring(0, 2) as SupportedLanguage) || 'en',
  );

  useEffect(() => {
    StorageService.getSettings().then((settings) => {
      if (settings.language && settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
        setLanguageState(settings.language);
      }
    });
  }, [i18n]);

  const changeLanguage = useCallback(
    async (lng: SupportedLanguage) => {
      await i18n.changeLanguage(lng);
      setLanguageState(lng);
      await StorageService.saveSettings({ language: lng });
    },
    [i18n],
  );

  return { language, changeLanguage };
}
