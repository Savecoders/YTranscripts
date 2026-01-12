import AdapterBrowser from './browser.adapter';

class FirefoxService implements AdapterBrowser<browser.tabs.Tab> {
  private currentTab?: browser.tabs.Tab;

  constructor() { }

  private async getActiveTab(): Promise<browser.tabs.Tab> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getBrowserTab(): Promise<browser.tabs.Tab> {
    if (!this.currentTab) {
      this.currentTab = await this.getActiveTab();
    }
    return this.currentTab;
  }

  async executeScript<R>(callback: () => void): Promise<R> {
    const tab = await this.getBrowserTab();
    return browser.scripting
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

export default FirefoxService;
