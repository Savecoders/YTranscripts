/// <reference types="vitest/globals" />
import Transcriptions from '@/content/transcript.service';
import type BrowserAdapter from '@/services/browser/browser.adapter';

function createMockAdapter(
  overrides: Partial<BrowserAdapter<{ url?: string }>> = {},
): BrowserAdapter<{ url?: string }> {
  return {
    getBrowserTab: vi
      .fn()
      .mockResolvedValue({ url: 'https://www.youtube.com/watch?v=abc123' }),
    executeScript: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('Transcriptions', () => {
  describe('getUrlBroswerTab', () => {
    it('should return the URL from the browser tab', async () => {
      const adapter = createMockAdapter();
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const url = await service.getUrlBroswerTab();
      expect(url).toBe('https://www.youtube.com/watch?v=abc123');
    });

    it('should return undefined if tab has no URL', async () => {
      const adapter = createMockAdapter({
        getBrowserTab: vi.fn().mockResolvedValue({}),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const url = await service.getUrlBroswerTab();
      expect(url).toBeUndefined();
    });
  });

  describe('isYoutubeTab', () => {
    it('should return true for a YouTube URL', async () => {
      const adapter = createMockAdapter();
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.isYoutubeTab();
      expect(result).toBe(true);
    });

    it('should return false for a non-YouTube URL', async () => {
      const adapter = createMockAdapter({
        getBrowserTab: vi.fn().mockResolvedValue({ url: 'https://www.google.com' }),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.isYoutubeTab();
      expect(result).toBe(false);
    });

    it('should return undefined when URL is undefined', async () => {
      const adapter = createMockAdapter({
        getBrowserTab: vi.fn().mockResolvedValue({}),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.isYoutubeTab();
      expect(result).toBeUndefined();
    });
  });

  describe('getVideoTitle', () => {
    it('should return null if not on a YouTube tab', async () => {
      const adapter = createMockAdapter({
        getBrowserTab: vi.fn().mockResolvedValue({ url: 'https://www.google.com' }),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const title = await service.getVideoTitle();
      expect(title).toBeNull();
      expect(adapter.executeScript).not.toHaveBeenCalled();
    });

    it('should call executeScript when on a YouTube tab', async () => {
      const adapter = createMockAdapter({
        executeScript: vi.fn().mockResolvedValue('My Video Title'),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const title = await service.getVideoTitle();
      expect(title).toBe('My Video Title');
      expect(adapter.executeScript).toHaveBeenCalledOnce();
    });
  });

  describe('textTranscriptionVideo', () => {
    it('should return null if not on a YouTube tab', async () => {
      const adapter = createMockAdapter({
        getBrowserTab: vi.fn().mockResolvedValue({ url: 'https://www.example.com' }),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.textTranscriptionVideo();
      expect(result).toBeNull();
    });

    it('should call executeScript and return transcript text', async () => {
      const adapter = createMockAdapter({
        executeScript: vi.fn().mockResolvedValue('Hello world transcript'),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.textTranscriptionVideo();
      expect(result).toBe('Hello world transcript');
      expect(adapter.executeScript).toHaveBeenCalledOnce();
    });

    it('should return null when executeScript returns null (no transcript found)', async () => {
      const adapter = createMockAdapter({
        executeScript: vi.fn().mockResolvedValue(null),
      });
      const service = new Transcriptions(
        adapter as unknown as BrowserAdapter<BrowserTab>,
      );
      const result = await service.textTranscriptionVideo();
      expect(result).toBeNull();
    });
  });
});
