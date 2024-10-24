interface BrowserAdapter<T> {
  getBrowserTab(): Promise<T>;
  executeScript(callback: () => void): Promise<void>;
}

export default BrowserAdapter;
