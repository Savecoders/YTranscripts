interface BrowserAdapter<T> {
  getBrowserTab(): Promise<T>;
  executeScript<R>(callback: () => Promise<R>): Promise<R>;
}

export default BrowserAdapter;
