/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';

// Mock chrome.storage.local API for tests that use chrome storage path
// In jsdom, `chrome` is undefined, so StorageService naturally falls back to localStorage.
// This mock is available if tests explicitly need the chrome.storage path.
const chromeStorageMock = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([]),
  },
};

// Expose as global but don't assign by default — tests opt in if needed
export { chromeStorageMock };

if (typeof globalThis.chrome === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = undefined;
}

// Provide a proper in-memory localStorage polyfill if jsdom doesn't supply one
// with standard methods (Vitest 4 + jsdom 28 can have localStorage without methods).
function ensureLocalStorage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (
    typeof g.localStorage === 'undefined' ||
    typeof g.localStorage.getItem !== 'function'
  ) {
    const store = new Map<string, string>();
    g.localStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, String(value));
      },
      removeItem(key: string) {
        store.delete(key);
      },
      clear() {
        store.clear();
      },
      get length() {
        return store.size;
      },
      key(index: number) {
        return [...store.keys()][index] ?? null;
      },
    };
  }
}

ensureLocalStorage();

// Clear localStorage between tests to prevent state leaking
beforeEach(() => {
  localStorage.clear();
});
