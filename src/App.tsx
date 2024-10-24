import { useEffect, useState } from 'react';
import { detectBrowser } from './utils/detectBrowser';
import { ChromeService, FirefoxService, TranscriptService } from './services';
function App() {
  const [transcriptService, setTranscriptService] = useState<TranscriptService | null>(null);

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
      transcriptService.transcriptionVideo();
    }
  };

  return (
    <>
      <button onClick={onclick}>Click me</button>
    </>
  );
}

export default App;
