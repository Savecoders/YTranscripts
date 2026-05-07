/// <reference types="vitest/globals" />

// Mock StorageService before importing the store
vi.mock('@/services/storage/storage.service', () => {
  return {
    StorageService: {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTranscript: vi.fn().mockResolvedValue(undefined),
      deleteTranscript: vi.fn().mockResolvedValue(undefined),
      updateTranscript: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock i18n
vi.mock('@/i18n', () => ({
  default: {
    t: (key: string) => key,
  },
}));

import { useTranscriptStore } from '@/store/transcript.store';
import { StorageService } from '@/services/storage/storage.service';
import type { TranscriptEntry } from '@/services/storage/storage.service';

function makeEntry(overrides: Partial<TranscriptEntry> = {}): TranscriptEntry {
  return {
    id: 'test-id',
    title: 'Test Video',
    url: 'https://www.youtube.com/watch?v=abc123',
    transcript: 'Test transcript text',
    date: Date.now(),
    ...overrides,
  };
}

describe('useTranscriptStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the Zustand store state between tests
    useTranscriptStore.setState({
      history: [],
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have empty history, not loading, no error', () => {
      const state = useTranscriptStore.getState();
      expect(state.history).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadHistory', () => {
    it('should load history from StorageService', async () => {
      const entries = [makeEntry({ id: 'id-1' }), makeEntry({ id: 'id-2' })];
      vi.mocked(StorageService.getHistory).mockResolvedValueOnce(entries);

      await useTranscriptStore.getState().loadHistory();

      const state = useTranscriptStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error state when loading fails', async () => {
      vi.mocked(StorageService.getHistory).mockRejectedValueOnce(
        new Error('Storage error'),
      );

      await useTranscriptStore.getState().loadHistory();

      const state = useTranscriptStore.getState();
      expect(state.history).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('store.failedToLoadHistory');
    });
  });

  describe('addTranscript', () => {
    it('should save transcript and refresh history', async () => {
      const entry = makeEntry({ id: 'new-id' });
      vi.mocked(StorageService.getHistory).mockResolvedValueOnce([entry]);

      await useTranscriptStore.getState().addTranscript(entry);

      expect(StorageService.saveTranscript).toHaveBeenCalledWith(entry);
      const state = useTranscriptStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('new-id');
      expect(state.isLoading).toBe(false);
    });

    it('should set error state when saving fails', async () => {
      vi.mocked(StorageService.saveTranscript).mockRejectedValueOnce(
        new Error('Save failed'),
      );

      await useTranscriptStore.getState().addTranscript(makeEntry());

      const state = useTranscriptStore.getState();
      expect(state.error).toBe('store.failedToSaveTranscript');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('deleteTranscript', () => {
    it('should delete transcript and update state optimistically', async () => {
      useTranscriptStore.setState({
        history: [makeEntry({ id: 'id-1' }), makeEntry({ id: 'id-2' })],
      });

      await useTranscriptStore.getState().deleteTranscript('id-1');

      expect(StorageService.deleteTranscript).toHaveBeenCalledWith('id-1');
      const state = useTranscriptStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('id-2');
    });

    it('should set error state when deletion fails', async () => {
      useTranscriptStore.setState({
        history: [makeEntry({ id: 'id-1' })],
      });
      vi.mocked(StorageService.deleteTranscript).mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await useTranscriptStore.getState().deleteTranscript('id-1');

      const state = useTranscriptStore.getState();
      expect(state.error).toBe('store.failedToDeleteTranscript');
    });
  });

  describe('updateTranscript', () => {
    it('should optimistically update the transcript in state', async () => {
      useTranscriptStore.setState({
        history: [makeEntry({ id: 'id-1', title: 'Old Title' })],
      });

      await useTranscriptStore
        .getState()
        .updateTranscript('id-1', { title: 'New Title' });

      expect(StorageService.updateTranscript).toHaveBeenCalledWith('id-1', {
        title: 'New Title',
      });
      const state = useTranscriptStore.getState();
      expect(state.history[0].title).toBe('New Title');
    });

    it('should rollback by reloading history when update fails', async () => {
      const original = makeEntry({ id: 'id-1', title: 'Original' });
      useTranscriptStore.setState({ history: [original] });

      vi.mocked(StorageService.updateTranscript).mockRejectedValueOnce(
        new Error('Update failed'),
      );
      vi.mocked(StorageService.getHistory).mockResolvedValueOnce([original]);

      await useTranscriptStore.getState().updateTranscript('id-1', {
        title: 'Should rollback',
      });

      // loadHistory is called on error, which re-fetches from StorageService
      expect(StorageService.getHistory).toHaveBeenCalled();
    });
  });

  describe('getTranscriptByUrl', () => {
    it('should find a transcript by exact URL match', () => {
      const entry = makeEntry({ id: 'id-1', url: 'https://www.youtube.com/watch?v=abc' });
      useTranscriptStore.setState({ history: [entry] });

      const found = useTranscriptStore
        .getState()
        .getTranscriptByUrl('https://www.youtube.com/watch?v=abc');
      expect(found).toBeDefined();
      expect(found?.id).toBe('id-1');
    });

    it('should find a transcript when search URL contains the stored URL', () => {
      const entry = makeEntry({ id: 'id-1', url: 'https://www.youtube.com/watch?v=abc' });
      useTranscriptStore.setState({ history: [entry] });

      const found = useTranscriptStore
        .getState()
        .getTranscriptByUrl('https://www.youtube.com/watch?v=abc&t=120');
      expect(found).toBeDefined();
      expect(found?.id).toBe('id-1');
    });

    it('should return undefined when no match is found', () => {
      useTranscriptStore.setState({ history: [makeEntry()] });
      const found = useTranscriptStore
        .getState()
        .getTranscriptByUrl('https://www.youtube.com/watch?v=nonexistent');
      expect(found).toBeUndefined();
    });
  });
});
