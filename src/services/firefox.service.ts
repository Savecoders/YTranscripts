import AdapterBrowser from './browser.adapter';

class FirefoxService implements AdapterBrowser<browser.tabs.Tab> {
  private tab?: browser.tabs.Tab;

  constructor() {}

  async getBrowserTab(): Promise<browser.tabs.Tab> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getTab(): Promise<browser.tabs.Tab> {
    return this.getBrowserTab();
  }

  async executeScript(callback: () => void): Promise<void> {
    if (!this.tab) {
      this.tab = await this.getBrowserTab();
    }
    await browser.scripting.executeScript({
      target: { tabId: this.tab.id! },
      func: callback,
    });
  }
}

export default FirefoxService;
