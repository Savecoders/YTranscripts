import AdapterBrowser from './browser.adapter';

class ChromeAdapter implements AdapterBrowser<chrome.tabs.Tab> {
  private tab?: chrome.tabs.Tab;

  constructor() {}

  async GetBrowserTab(): Promise<chrome.tabs.Tab> {
    const tabs = await new Promise<chrome.tabs.Tab[]>(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    if (tabs.length) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getTab(): Promise<chrome.tabs.Tab> {
    return this.GetBrowserTab();
  }

  async executeScript(callback: () => void): Promise<void> {
    if (!this.tab) {
      this.tab = await this.GetBrowserTab();
    }
    chrome.scripting.executeScript({
      target: { tabId: this.tab.id! },
      func: callback,
    });
  }
}

export default ChromeAdapter;
