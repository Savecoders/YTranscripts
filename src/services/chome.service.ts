import AdapterBrowser from './browser.adapter';

class ChromeService implements AdapterBrowser<chrome.tabs.Tab> {
  private currentTab?: chrome.tabs.Tab;

  constructor() {}

  private async getActiveTab(): Promise<chrome.tabs.Tab> {
    const tabs = await new Promise<chrome.tabs.Tab[]>(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    if (tabs.length) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getBrowserTab(): Promise<chrome.tabs.Tab> {
    if (!this.currentTab) {
      this.currentTab = await this.getActiveTab();
    }
    return this.currentTab;
  }

  async executeScript(callback: () => void): Promise<void> {
    const tab = await this.getBrowserTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: callback,
    });
  }
}

export default ChromeService;
