/// <reference types="vitest/globals" />

describe('detectBrowser', () => {
  const originalNavigator = globalThis.navigator;

  function mockUserAgent(ua: string) {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: ua },
      writable: true,
      configurable: true,
    });
  }

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    // Clear module cache so detectBrowser re-reads navigator on each test
    vi.resetModules();
  });

  it('should return "chrome" for Chrome user agent', async () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    const { detectBrowser } = await import('@/shared/utils/detectBrowser');
    expect(detectBrowser()).toBe('chrome');
  });

  it('should return "chrome" for Edge user agent (contains "chrome")', async () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    );
    const { detectBrowser } = await import('@/shared/utils/detectBrowser');
    expect(detectBrowser()).toBe('chrome');
  });

  it('should return "firefox" for Firefox user agent', async () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    );
    const { detectBrowser } = await import('@/shared/utils/detectBrowser');
    expect(detectBrowser()).toBe('firefox');
  });

  it('should return "other" for Safari user agent', async () => {
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    );
    const { detectBrowser } = await import('@/shared/utils/detectBrowser');
    expect(detectBrowser()).toBe('other');
  });

  it('should return "other" for an unknown user agent', async () => {
    mockUserAgent('SomeCustomBot/1.0');
    const { detectBrowser } = await import('@/shared/utils/detectBrowser');
    expect(detectBrowser()).toBe('other');
  });
});
