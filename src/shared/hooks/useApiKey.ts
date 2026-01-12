import { useState, useEffect } from 'react';
import { StorageService } from '@/services/storage/storage.service';

export function useApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await StorageService.getSettings();
      setApiKey(settings.geminiApiKey || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async (newApiKey: string) => {
    setIsSaving(true);
    try {
      await StorageService.saveSettings({ geminiApiKey: newApiKey });
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    saveApiKey,
    isSaving,
    isLoading
  };
}
