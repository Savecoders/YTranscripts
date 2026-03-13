import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/components/ui/switch';
import { ColorModeButton } from '@/shared/components/ui/color-mode';
import { useColorMode } from '@/shared/hooks/useColorMode';
import { StorageService } from '@/services/storage/storage.service';
import { DefineApiKey } from './DefineApiKey';
import { useApiKeySettings } from '@/shared/hooks/useApiKey';
import { useLanguage, SupportedLanguage } from '@/shared/hooks/useLanguage';
import { LuTrash2 } from 'react-icons/lu';
import { toaster } from '@/shared/constants/toaster';

export function SettingsDetail() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const [saveHistory, setSaveHistory] = useState(true);
  const { apiKey, setApiKey, saveApiKey } = useApiKeySettings();
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    StorageService.getSettings().then((settings) => {
      setSaveHistory(settings.saveHistory);
    });
  }, []);

  const handleToggleHistory = async (e: { checked: boolean }) => {
    setSaveHistory(e.checked);
    await StorageService.saveSettings({ saveHistory: e.checked });
  };

  const handleSaveApiKey = async (newKey: string) => {
    const success = await saveApiKey(newKey);
    if (success) {
      setApiKey(newKey);
    }
    return success;
  };

  const handleDeleteApiKey = async () => {
    await saveApiKey('');
    setApiKey('');
    toaster.create({
      title: t('settings.apiKeyRemoved'),
      type: 'info',
    });
  };

  const handleLanguageChange = async (lng: SupportedLanguage) => {
    await changeLanguage(lng);
  };

  return (
    <Box color={'fg'} maxW="800px" mx="auto">
      <Heading size="lg" mb={6}>
        {t('settings.title')}
      </Heading>

      <VStack align="stretch" gap={6}>
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
          <Heading size="md" mb={4}>
            {t('settings.appearance')}
          </Heading>
          <HStack justifyContent="space-between">
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">{t('settings.theme')}</Text>
              <Text fontSize="sm" color="fg.muted">
                {t('settings.themeDesc')}
              </Text>
            </VStack>
            <HStack>
              <Text fontSize="sm" color="fg.muted">
                {colorMode === 'light' ? t('settings.light') : t('settings.dark')}
              </Text>
              <ColorModeButton />
            </HStack>
          </HStack>
        </Box>

        {/* Language Section */}
        <Box
          color={'fg'}
          bg="bg.panel"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          shadow="sm"
        >
          <Heading size="md" mb={4}>
            {t('settings.language')}
          </Heading>
          <HStack justifyContent="space-between">
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">{t('settings.language')}</Text>
              <Text fontSize="sm" color="fg.muted">
                {t('settings.languageDesc')}
              </Text>
            </VStack>
            <HStack gap={2}>
              <Button
                size="sm"
                variant={language === 'en' ? 'solid' : 'outline'}
                onClick={() => handleLanguageChange('en')}
              >
                {t('settings.english')}
              </Button>
              <Button
                size="sm"
                variant={language === 'es' ? 'solid' : 'outline'}
                onClick={() => handleLanguageChange('es')}
              >
                {t('settings.spanish')}
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* General Section */}
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
          <Heading size="md" mb={4}>
            {t('settings.general')}
          </Heading>
          <HStack justifyContent="space-between">
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">{t('settings.saveHistory')}</Text>
              <Text fontSize="sm" color="fg.muted">
                {t('settings.saveHistoryDesc')}
              </Text>
            </VStack>
            <Switch
              checked={saveHistory}
              onCheckedChange={handleToggleHistory}
              colorPalette="teal"
            />
          </HStack>
        </Box>

        {/* Integrations Section */}
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
          <Heading size="md" mb={4}>
            {t('settings.integrations')}
          </Heading>
          <HStack justifyContent="space-between">
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">{t('settings.geminiApi')}</Text>
              <Text fontSize="sm" color="fg.muted">
                {t('settings.geminiApiDesc')}
              </Text>
            </VStack>
            <HStack>
              {apiKey && (
                <Button variant="ghost" colorPalette="red" onClick={handleDeleteApiKey}>
                  <LuTrash2 /> {t('common.delete')}
                </Button>
              )}
              <DefineApiKey initialApiKey={apiKey} onSave={handleSaveApiKey} />
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
