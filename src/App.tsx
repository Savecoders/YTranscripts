import { useEffect, useState } from 'react';
import { detectBrowser } from './utils/detectBrowser';
import { ChromeService, FirefoxService, TranscriptService } from './services';
import { ClipboardIconButton, ClipboardInput } from '@/components/ui/clipboard';
import { Button, ClipboardRoot } from '@chakra-ui/react';
import { InputGroup } from './components/ui/input-group';
import { SkeletonText } from './components/ui/skeleton';
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
      <Button style={{ marginBottom: '1rem' }} variant='outline' onClick={onclick}>
        Generate Transcript Video 🔥
      </Button>

      {isLoading ? (
        <SkeletonText noOfLines={3} gap='4' />
      ) : (
        textTranscription && (
          <ClipboardRoot maxW='400px' value={textTranscription || ''}>
            <InputGroup
              width='full'
              lineHeight={1}
              autoFocus
              endElement={<ClipboardIconButton me='-2' />}
            >
              <ClipboardInput />
            </InputGroup>
          </ClipboardRoot>
        )
      )}
    </>
  );
}

export default App;
