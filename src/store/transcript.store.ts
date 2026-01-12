import { create } from 'zustand';
import { StorageService, TranscriptEntry } from '@/services/storage/storage.service';

export interface TranscriptState {
  history: TranscriptEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHistory: () => Promise<void>;
  addTranscript: (entry: TranscriptEntry) => Promise<void>;
  deleteTranscript: (id: string) => Promise<void>;
  updateTranscript: (id: string, updates: Partial<TranscriptEntry>) => Promise<void>;
  getTranscriptByUrl: (url: string) => TranscriptEntry | undefined;
}

export const useTranscriptStore = create<TranscriptState>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await StorageService.getHistory();
      set({ history, isLoading: false });
    } catch (error) {
      console.error('Failed to load history:', error);
      set({ error: 'Failed to load history', isLoading: false });
    }
  },

  addTranscript: async (entry: TranscriptEntry) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveTranscript(entry);
      // Refresh local state from storage to ensure consistency
      const history = await StorageService.getHistory();
      set({ history, isLoading: false });
    } catch (error) {
      console.error('Failed to save transcript:', error);
      set({ error: 'Failed to save transcript', isLoading: false });
    }
  },

  deleteTranscript: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteTranscript(id);
      // Optimistic update or refresh
      const history = get().history.filter(item => item.id !== id);
      set({ history, isLoading: false });
    } catch (error) {
      console.error('Failed to delete transcript:', error);
      set({ error: 'Failed to delete transcript', isLoading: false });
    }
  },

  updateTranscript: async (id: string, updates: Partial<TranscriptEntry>) => {
    // Optimistic update
    set(state => ({
      history: state.history.map(item => (item.id === id ? { ...item, ...updates } : item)),
    }));

    try {
      await StorageService.updateTranscript(id, updates);
    } catch (error) {
      console.error('Failed to update transcript:', error);
      get().loadHistory();
    }
  },

  getTranscriptByUrl: (url: string) => {
    // Normalizes URL slightly to match typical YouTube variations if needed
    // For now, strict check or contains check
    return get().history.find(item => item.url === url || url.includes(item.url));
  },
}));
