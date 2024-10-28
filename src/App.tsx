import { useEffect, useState } from 'react';
import { Button, Flex, Link, Skeleton, Text } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';
import { detectBrowser } from '@/utils/detectBrowser';
import { ClipTranscription } from '@/components/ui/clip-transcription';
import { ChromeService, FirefoxService, TranscriptService } from '@/services';
function App() {
  const [transcriptService, setTranscriptService] = useState<TranscriptService | null>(null);
  const [textTranscription, setTextTranscript] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const browser = detectBrowser();
    if (browser === 'chrome') {
      setTranscriptService(new TranscriptService(new ChromeService())); // Chrome, Edge, Brave
    } else if (browser === 'firefox') {
      setTranscriptService(new TranscriptService(new FirefoxService()));
    } else {
      console.warn('Navegador no soportado o desconocido');
    }
  }, []);

  const onclick = async () => {
    if (transcriptService) {
      setIsLoading(true);
      const text = await transcriptService.textTranscriptionVideo();
      setTextTranscript(text);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant='outline' marginBottom={4} onClick={onclick}>
        Generate Transcript Video 🔥
      </Button>

      {isLoading ? (
        <Skeleton height='135px' marginBottom={4} />
      ) : (
        textTranscription && (
          <ClipTranscription
            textTranscription={textTranscription}
            style={{ marginBottom: '1.2rem' }}
          />
        )
      )}
      <Flex justifyContent='center'>
        <Text>
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
    </>
  );
}

export default App;
