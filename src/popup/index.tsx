import { useEffect, useState } from 'react';
import BrowserAdapter from '../services/browser.adapter';
import ChromeService from '../services/chome.service';
import FirefoxService from '../services/firefox.service';
import { detectBrowser } from '../utils/detectBrowser';

export default function PopPage() {
  const [browserAdapter, setBrowserAdapter] = useState<BrowserAdapter<BrowserTab> | null>(null);

  useEffect(() => {
    const browser = detectBrowser();
    if (browser === 'chrome') {
      setBrowserAdapter(new ChromeService()); // Chrome, Edge, Brave
    } else if (browser === 'firefox') {
      setBrowserAdapter(new FirefoxService()); // Firefox
    } else {
      console.warn('Navegador no soportado o desconocido');
    }
  }, []);

  const onclick = async () => {
    if (browserAdapter) {
      await browserAdapter.executeScript(() => {
        console.log('Hello from the browser!');
      });
    }
  };
  return (
    <>
      <button onClick={onclick}>Click me Hello</button>
    </>
  );
}
