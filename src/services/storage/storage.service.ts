export interface TranscriptEntry {
  id: string;
  title: string;
  url: string;
  transcript: string;
  diagramCode?: string;
  date: number;
}

export interface AppSettings {
  geminiApiKey: string;
  saveHistory: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  saveHistory: true, // Default to true as per "any other flow that is recommended"
};

export class StorageService {
  /// Get application settings
  static async getSettings(): Promise<AppSettings> {
    if (!chrome?.storage?.local) {
      const stored = localStorage.getItem('appSettings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    }

    const result = await chrome.storage.local.get(['appSettings']);
    return result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
  }

  /// Save application settings
  static async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    const newSettings = { ...current, ...settings };

    if (!chrome?.storage?.local) {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return;
    }
    await chrome.storage.local.set({ appSettings: newSettings });
  }

  /// save transcript in history
  static async saveTranscript(entry: TranscriptEntry): Promise<void> {
    const settings = await this.getSettings();
    let history = await this.getHistory();

    if (!settings.saveHistory) {
      // If disabled, only save the last one (replace history)
      history = [entry];
    } else {
      history.unshift(entry);
      if (history.length > 50) history.pop();
    }

    if (!chrome?.storage?.local) {
      localStorage.setItem('transcriptHistory', JSON.stringify(history));
      return;
    }
    await chrome.storage.local.set({ transcriptHistory: history });
  }

  /// get transcript history
  static async getHistory(): Promise<TranscriptEntry[]> {
    if (!chrome?.storage?.local) {
      const stored = localStorage.getItem('transcriptHistory');
      return stored ? JSON.parse(stored) : [];
    }
    const result = await chrome.storage.local.get(['transcriptHistory']);
    return result.transcriptHistory || [];
  }

  /// update a transcript entry
  static async updateTranscript(id: string, updates: Partial<TranscriptEntry>): Promise<void> {
    const history = await this.getHistory();
    const index = history.findIndex(item => item.id === id);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      if (!chrome?.storage?.local) {
        localStorage.setItem('transcriptHistory', JSON.stringify(history));
        return;
      }
      await chrome.storage.local.set({ transcriptHistory: history });
    }
  }

  /// delete a transcript entry
  static async deleteTranscript(id: string): Promise<void> {
    const history = (await this.getHistory()).filter(item => item.id !== id);
    if (!chrome?.storage?.local) {
      localStorage.setItem('transcriptHistory', JSON.stringify(history));
      return;
    }
    await chrome.storage.local.set({ transcriptHistory: history });
  }
}
