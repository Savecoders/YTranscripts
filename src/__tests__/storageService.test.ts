/// <reference types="vitest/globals" />
import { StorageService } from '@/services/storage/storage.service';
import type { TranscriptEntry } from '@/services/storage/storage.service';

// In jsdom, chrome is undefined, so StorageService uses the localStorage fallback path.

function makeEntry(overrides: Partial<TranscriptEntry> = {}): TranscriptEntry {
  return {
    id: overrides.id ?? 'test-id-1',
    title: overrides.title ?? 'Test Video',
    url: overrides.url ?? 'https://www.youtube.com/watch?v=abc123',
    transcript: overrides.transcript ?? 'This is a test transcript.',
    date: overrides.date ?? Date.now(),
    ...overrides,
  };
}

describe('StorageService', () => {
  // localStorage is cleared in setup.ts beforeEach

  describe('getSettings', () => {
    it('should return default settings when nothing is stored', async () => {
      const settings = await StorageService.getSettings();
      expect(settings).toEqual({
        geminiApiKey: '',
        saveHistory: true,
        language: 'en',
      });
    });

    it('should return stored settings merged with defaults', async () => {
      localStorage.setItem('appSettings', JSON.stringify({ geminiApiKey: 'my-key' }));
      const settings = await StorageService.getSettings();
      expect(settings.geminiApiKey).toBe('my-key');
      expect(settings.saveHistory).toBe(true); // default
      expect(settings.language).toBe('en'); // default
    });
  });

  describe('saveSettings', () => {
    it('should save partial settings merged with existing', async () => {
      await StorageService.saveSettings({ geminiApiKey: 'key-1' });
      let settings = await StorageService.getSettings();
      expect(settings.geminiApiKey).toBe('key-1');
      expect(settings.saveHistory).toBe(true);

      await StorageService.saveSettings({ saveHistory: false });
      settings = await StorageService.getSettings();
      expect(settings.geminiApiKey).toBe('key-1'); // preserved
      expect(settings.saveHistory).toBe(false);
    });

    it('should save language setting', async () => {
      await StorageService.saveSettings({ language: 'es' });
      const settings = await StorageService.getSettings();
      expect(settings.language).toBe('es');
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no history is stored', async () => {
      const history = await StorageService.getHistory();
      expect(history).toEqual([]);
    });

    it('should return stored history', async () => {
      const entry = makeEntry();
      localStorage.setItem('transcriptHistory', JSON.stringify([entry]));
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('test-id-1');
    });
  });

  describe('saveTranscript', () => {
    it('should add a transcript to history', async () => {
      const entry = makeEntry();
      await StorageService.saveTranscript(entry);
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('test-id-1');
    });

    it('should prepend new entries (most recent first)', async () => {
      const entry1 = makeEntry({ id: 'id-1', date: 1000 });
      const entry2 = makeEntry({ id: 'id-2', date: 2000 });
      await StorageService.saveTranscript(entry1);
      await StorageService.saveTranscript(entry2);
      const history = await StorageService.getHistory();
      expect(history[0].id).toBe('id-2');
      expect(history[1].id).toBe('id-1');
    });

    it('should cap history at 50 entries', async () => {
      // Save 50 entries
      for (let i = 0; i < 50; i++) {
        await StorageService.saveTranscript(makeEntry({ id: `id-${i}` }));
      }
      expect(await StorageService.getHistory()).toHaveLength(50);

      // Save 51st entry — oldest should be removed
      await StorageService.saveTranscript(makeEntry({ id: 'id-50' }));
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(50);
      expect(history[0].id).toBe('id-50'); // newest first
      // The very first entry (id-0) should have been popped
      expect(history.find((e) => e.id === 'id-0')).toBeUndefined();
    });

    it('should replace history with single entry when saveHistory is disabled', async () => {
      await StorageService.saveSettings({ saveHistory: false });
      await StorageService.saveTranscript(makeEntry({ id: 'id-1' }));
      await StorageService.saveTranscript(makeEntry({ id: 'id-2' }));
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('id-2');
    });
  });

  describe('updateTranscript', () => {
    it('should update an existing transcript by id', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1', title: 'Original' }));
      await StorageService.updateTranscript('id-1', { title: 'Updated' });
      const history = await StorageService.getHistory();
      expect(history[0].title).toBe('Updated');
    });

    it('should add diagramCode to an existing transcript', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1' }));
      await StorageService.updateTranscript('id-1', {
        diagramCode: 'flowchart TD\nA-->B',
      });
      const history = await StorageService.getHistory();
      expect(history[0].diagramCode).toBe('flowchart TD\nA-->B');
    });

    it('should do nothing if id is not found', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1', title: 'Original' }));
      await StorageService.updateTranscript('nonexistent', { title: 'Ghost' });
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].title).toBe('Original');
    });
  });

  describe('deleteTranscript', () => {
    it('should remove a transcript by id', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1' }));
      await StorageService.saveTranscript(makeEntry({ id: 'id-2' }));
      await StorageService.deleteTranscript('id-1');
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('id-2');
    });

    it('should handle deleting a non-existent id gracefully', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1' }));
      await StorageService.deleteTranscript('nonexistent');
      const history = await StorageService.getHistory();
      expect(history).toHaveLength(1);
    });

    it('should result in empty history when last entry is deleted', async () => {
      await StorageService.saveTranscript(makeEntry({ id: 'id-1' }));
      await StorageService.deleteTranscript('id-1');
      const history = await StorageService.getHistory();
      expect(history).toEqual([]);
    });
  });
});
