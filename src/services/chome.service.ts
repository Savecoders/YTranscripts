import AdapterBrowser from './browser.adapter';

class ChromeService implements AdapterBrowser<chrome.tabs.Tab> {
  private currentTab?: chrome.tabs.Tab;

  constructor() {}

  private async getActiveTab(): Promise<chrome.tabs.Tab> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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

  async executeScript<R>(callback: () => Promise<R>): Promise<R> {
    const tab = await this.getBrowserTab();

    return chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        func: callback,
      })
      .then(injectionResults =>
        injectionResults.length ? (injectionResults[0].result as R) : <R>null,
      )
      .catch(error => {
        console.error(error);
        return <R>null;
      });
  }
}

export default ChromeService;
