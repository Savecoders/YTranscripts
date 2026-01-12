import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { Switch } from '@/shared/components/ui/switch';
import { ColorModeButton } from '@/shared/components/ui/color-mode';
import { useColorMode } from '@/shared/hooks/useColorMode';
import { StorageService } from '@/services/storage/storage.service';
import { DefineApiKey } from './DefineApiKey';
import { useApiKeySettings } from '@/shared/hooks/useApiKey';
import { LuTrash2 } from 'react-icons/lu';
import { toaster } from '@/shared/constants/toaster';

export function SettingsDetail() {
  const { colorMode } = useColorMode();
  const [saveHistory, setSaveHistory] = useState(true);
  const { apiKey, setApiKey, saveApiKey } = useApiKeySettings();

  useEffect(() => {
    StorageService.getSettings().then(settings => {
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
      title: 'API Key removed',
      type: 'info',
    });
  };

  return (
    <Box maxW='800px' mx='auto'>
      <Heading size='lg' mb={6}>
        Settings
      </Heading>

      <VStack align='stretch' gap={6}>
        {/* Appearance Section */}
        <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px' shadow='sm'>
          <Heading size='md' mb={4}>
            Appearance
          </Heading>
          <HStack justifyContent='space-between'>
            <VStack align='start' gap={0}>
              <Text fontWeight='medium'>Theme</Text>
              <Text fontSize='sm' color='fg.muted'>
                Toggle between light and dark mode
              </Text>
            </VStack>
            <HStack>
              <Text fontSize='sm' color='fg.muted'>
                {colorMode === 'light' ? 'Light' : 'Dark'}
              </Text>
              <ColorModeButton />
            </HStack>
          </HStack>
        </Box>

        {/* General Section */}
        <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px' shadow='sm'>
          <Heading size='md' mb={4}>
            General
          </Heading>
          <HStack justifyContent='space-between'>
            <VStack align='start' gap={0}>
              <Text fontWeight='medium'>Save Transcript History</Text>
              <Text fontSize='sm' color='fg.muted'>
                If disabled, only the last generated transcript will be kept.
              </Text>
            </VStack>
            <Switch
              checked={saveHistory}
              onCheckedChange={handleToggleHistory}
              colorPalette='teal'
            />
          </HStack>
        </Box>

        {/* Integrations Section */}
        <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px' shadow='sm'>
          <Heading size='md' mb={4}>
            Integrations
          </Heading>
          <HStack justifyContent='space-between'>
            <VStack align='start' gap={0}>
              <Text fontWeight='medium'>Gemini API</Text>
              <Text fontSize='sm' color='fg.muted'>
                Configure your API Key to enable diagram generation
              </Text>
            </VStack>
            <HStack>
              {apiKey && (
                <Button variant='ghost' colorPalette='red' onClick={handleDeleteApiKey}>
                  <LuTrash2 /> Delete
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
