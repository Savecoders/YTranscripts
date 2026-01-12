import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.init(apiKey);
    }
  }

  init(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  static async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('API Key validation failed:', error);
      return false;
    }
  }

  async generateDiagramCode(transcript: string): Promise<string | null> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please set your API key in settings.');
    }

    const prompt = [
      'You are an expert in creating concept maps and diagrams using Mermaid.js.',
      'Based on the following video transcript, create a comprehensive concept map or flow chart (whichever is more appropriate) that summarizes the key points.',
      '',
      'IMPORTANT SYNTAX RULES:',
      '1. Start with "graph TD" or "flowchart TD".',
      '2. Use simple alphanumeric IDs for nodes (e.g., A, B, node1).',
      '3. ALWAYS enclose node labels in double quotes (e.g., A["Label Text"]).',
      '4. Escape special characters inside labels if necessary, or avoid them.',
      '5. Do not use brackets, braces, or parentheses inside labels unless enclosed in quotes.',
      '',
      'Return ONLY the Mermaid.js code block. Do not include markdown code fences (like ```mermaid).',
      'Do not include any other text or explanation. Just the code.',
      '',
      'Transcript:',
      transcript.substring(0, 30000)
    ].join('\n');

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown if present
      text = text.replace(/^```mermaid\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

      return text;
    } catch (error) {
      console.error('Error generating diagram:', error);
      throw error;
    }
  }
}

export default GeminiService;
