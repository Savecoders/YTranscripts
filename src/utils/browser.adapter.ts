interface BrowserAdapter<T> {
  getTab(): Promise<T>;
  executeScript(callback: () => void): Promise<void>;
}

export default BrowserAdapter;
