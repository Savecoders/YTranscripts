/// <reference types="vitest/globals" />

// Mock @google/generative-ai before importing GeminiService
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAI {
    getGenerativeModel: ReturnType<typeof vi.fn>;
    constructor() {
      mockGetGenerativeModel.mockClear();
      this.getGenerativeModel = mockGetGenerativeModel;
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI,
  };
});

import GeminiService from '@/services/storage/gemini.service';
import type { DiagramGenerationOptions } from '@/services/storage/gemini.service';

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor and init', () => {
    it('should create a GeminiService with an API key without throwing', () => {
      expect(() => new GeminiService('test-key')).not.toThrow();
    });

    it('should create a GeminiService without an API key', () => {
      expect(() => new GeminiService()).not.toThrow();
    });

    it('should allow late initialization via init()', () => {
      const service = new GeminiService();
      expect(() => service.init('late-key')).not.toThrow();
    });
  });

  describe('validateApiKey', () => {
    it('should return false for an empty API key', async () => {
      const result = await GeminiService.validateApiKey('');
      expect(result).toBe(false);
    });

    it('should return true when API call succeeds', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'ok' },
      });
      const result = await GeminiService.validateApiKey('valid-key');
      expect(result).toBe(true);
    });

    it('should return false when API call throws', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Invalid key'));
      const result = await GeminiService.validateApiKey('bad-key');
      expect(result).toBe(false);
    });
  });

  describe('generateDiagramCode', () => {
    it('should throw if model is not initialized', async () => {
      const service = new GeminiService();
      await expect(service.generateDiagramCode('test transcript')).rejects.toThrow(
        'Gemini API not initialized',
      );
    });

    it('should return cleaned diagram code on success', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => '```mermaid\nflowchart TD\nA-->B\n```',
        },
      });

      const service = new GeminiService('key');
      const result = await service.generateDiagramCode('some transcript');
      expect(result).toBe('flowchart TD\nA-->B');
    });

    it('should return raw text when no markdown fences present', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'flowchart TD\nA-->B',
        },
      });

      const service = new GeminiService('key');
      const result = await service.generateDiagramCode('some transcript');
      expect(result).toBe('flowchart TD\nA-->B');
    });

    it('should propagate errors from the API', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Rate limit exceeded'));

      const service = new GeminiService('key');
      await expect(service.generateDiagramCode('transcript')).rejects.toThrow(
        'Rate limit exceeded',
      );
    });

    it('should pass diagram type options to the prompt', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'mindmap\n  root((Topic))' },
      });

      const service = new GeminiService('key');
      const options: DiagramGenerationOptions = {
        diagramType: 'mindmap',
        direction: 'LR',
        language: 'es',
      };
      await service.generateDiagramCode('transcript text', options);

      // Verify the prompt was passed to generateContent
      const callArg = mockGenerateContent.mock.calls[0][0] as string;
      expect(callArg).toContain('Mind Map');
      expect(callArg).toContain('Spanish');
    });

    it('should truncate transcript to 30000 characters in prompt', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'flowchart TD\nA-->B' },
      });

      const longTranscript = 'a'.repeat(50000);
      const service = new GeminiService('key');
      await service.generateDiagramCode(longTranscript);

      const callArg = mockGenerateContent.mock.calls[0][0] as string;
      // The prompt includes "transcript.substring(0, 30000)" so it should
      // contain exactly 30000 'a' characters (the rest of the prompt has no 'a's
      // except in words like "Mermaid", "create", etc.)
      // Instead, verify the transcript portion is properly bounded
      const transcriptMarker = 'Transcript:\n';
      const transcriptStart = callArg.indexOf(transcriptMarker) + transcriptMarker.length;
      const transcriptPortion = callArg.substring(transcriptStart);
      expect(transcriptPortion.length).toBe(30000);
    });
  });
});
