import { useEffect, useState } from 'react';
import './App.css';
import BrowserAdapter from './utils/browser.adapter';
import { detectBrowser } from './libs/detectBrowser';
import FirefoxAdapter from './utils/firefox.adapter';
import ChromeAdapter from './utils/chome.adapter';

function App() {
  const [apapter, setAdapter] = useState<BrowserAdapter<BrowserTab> | null>(null);

  useEffect(() => {
    const browser = detectBrowser();
    if (browser === 'chrome') {
      setAdapter(new ChromeAdapter()); // Chrome, Edge, Brave
    } else if (browser === 'firefox') {
      setAdapter(new FirefoxAdapter()); // Firefox
    } else {
      console.warn('Navegador no soportado o desconocido');
    }
  }, []);

  const onclick = async () => {
    if (apapter) {
      await apapter.executeScript(() => {
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

export default App;
