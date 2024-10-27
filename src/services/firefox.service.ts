import AdapterBrowser from './browser.adapter';

class FirefoxService implements AdapterBrowser<browser.tabs.Tab> {
  private currentTab?: browser.tabs.Tab;

  constructor() {}

  private async getActiveTab(): Promise<browser.tabs.Tab> {
    const tabs = await new Promise<browser.tabs.Tab[]>(() => {
      browser.tabs.query({ active: true, currentWindow: true });
    });
    if (tabs.length) {
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

  async executeScript<R>(callback: () => Promise<R>): Promise<R> {
    const tab = await this.getBrowserTab();
    return new Promise<R>((resolve, reject) => {
      browser.scripting
        .executeScript({
          target: { tabId: tab.id! },
          func: () => {
            try {
              const result = callback();
              if (result instanceof Promise) {
                result.then(resolve).catch(reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          },
        })
        .then(() => {});
    });
  }
}

export default FirefoxService;
