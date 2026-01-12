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

function App() {
  const [transcriptService, setTranscriptService] = useState<Transcriptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // Store
  const { loadHistory, addTranscript, getTranscriptByUrl } = useTranscriptStore();

  useEffect(() => {
    // Initialize services and load data
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
          transcriptService.getUrlBroswerTab()
        ]);

        if (transcript) {
          const entry = {
            id: nanoid(),
            title: title || 'Untitled Video',
            url: url || '',
            transcript: transcript,
            date: Date.now()
          };

          await addTranscript(entry);

          // Use the updated state to show the copy UI immediately (via existingTranscript check)
          // The store update will trigger a re-render
        } else {
          alert('Could not fetch transcript. Make sure you are on a YouTube video with captions.');
        }

      } catch (error) {
        console.error(error);
        alert('An error occurred.');
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
    <Flex p={4} minW="320px" margin={4} gap={4} flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">YTranscripts</Heading>
        <Button
          width="32px"
          variant={existingTranscript ? 'outline' : 'ghost'}
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
          />) : (
          <Button
            width="full"
            variant='outline'
            onClick={handleGenerate}
            loading={isGenerating}
            loadingText="Analyzing Video..."
          >
            Get Transcript
          </Button>
        )}

      </VStack>

      {isGenerating && <Skeleton height='112px' />}

      <Flex justifyContent='center'>
        <Text fontSize="xs" color="gray.500">
          Created by{' '}
          <Link
            variant='underline'
            target='_blank'
            href='https://github.com/savecoders'
            colorPalette='teal'
          >
            Savecoders <LuExternalLink />
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
}

export default App;
