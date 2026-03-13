import { useEffect, useState } from 'react';
import { Flex, Link, Skeleton, Text, Heading, VStack } from '@chakra-ui/react';
import { LuExternalLink, LuArrowRight } from 'react-icons/lu';
import { detectBrowser } from '@/shared/utils/detectBrowser';
import { ChromeService, FirefoxService } from '@/services';
import { Transcriptions } from '@/content';
import { Button } from '@/shared/components/ui/button';
import { nanoid } from 'nanoid';
import { useTranscriptStore } from '@/store/transcript.store';
import { ClipTranscription } from '@/shared/components/ui/clip-transcription';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const [transcriptService, setTranscriptService] = useState<Transcriptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const { loadHistory, addTranscript, getTranscriptByUrl } = useTranscriptStore();

  useEffect(() => {
    const init = async () => {
      await loadHistory();

      const browser = detectBrowser();
      let service: Transcriptions | null = null;

      if (browser === 'chrome') {
        service = new Transcriptions(new ChromeService());
      } else if (browser === 'firefox') {
        service = new Transcriptions(new FirefoxService());
      }

      setTranscriptService(service);

      if (service) {
        const url = await service.getUrlBroswerTab();
        if (url) setCurrentUrl(url);
      }
    };

    init();
  }, [loadHistory]);

  const existingTranscript = currentUrl ? getTranscriptByUrl(currentUrl) : undefined;

  const handleGenerate = async () => {
    if (transcriptService) {
      setIsGenerating(true);
      try {
        const [transcript, title, url] = await Promise.all([
          transcriptService.textTranscriptionVideo(),
          transcriptService.getVideoTitle(),
          transcriptService.getUrlBroswerTab(),
        ]);

        if (transcript) {
          const entry = {
            id: nanoid(),
            title: title || t('popup.untitledVideo'),
            url: url || '',
            transcript: transcript,
            date: Date.now(),
          };

          await addTranscript(entry);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const openDashboard = () => {
    const url = 'src/pages/dashboard/index.html';
    if (chrome?.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <Flex
      p={4}
      minW="320px"
      minH="180px"
      maxH="auto"
      gap={4}
      flexDirection="column"
      justifyContent="space-between"
      overflow="hidden"
      bg={'bg.panel'}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading color={'teal.500'} size="md">
          {t('common.appName')}
        </Heading>
        <Button
          width="32px"
          variant={isGenerating ? 'solid' : existingTranscript ? 'outline' : 'ghost'}
          onClick={openDashboard}
        >
          <LuArrowRight />
        </Button>
      </Flex>

      <VStack gap={4} align="stretch">
        {existingTranscript ? (
          <ClipTranscription
            textTranscription={existingTranscript.transcript}
            style={{ marginBottom: '1.2rem' }}
          />
        ) : (
          <Button
            width="full"
            variant="outline"
            onClick={handleGenerate}
            loading={isGenerating}
            loadingText={t('popup.analyzingVideo')}
          >
            {t('popup.getTranscript')}
          </Button>
        )}
      </VStack>

      {isGenerating && <Skeleton height="112px" />}

      <Flex justifyContent="center">
        <Text fontSize="xs" color="gray.500">
          {t('common.createdBy')}{' '}
          <Link
            variant="underline"
            target="_blank"
            href="https://github.com/savecoders"
            colorPalette="teal"
          >
            Savecoders <LuExternalLink />
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
}

export default App;
