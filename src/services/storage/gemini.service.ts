import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type DiagramType =
  | 'flowchart'
  | 'mindmap'
  | 'sequenceDiagram'
  | 'classDiagram'
  | 'stateDiagram'
  | 'erDiagram'
  | 'timeline';

export interface DiagramGenerationOptions {
  diagramType?: DiagramType;
  direction?: 'TD' | 'LR' | 'RL' | 'BT';
  language?: string;
}

const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  flowchart: 'Flowchart',
  mindmap: 'Mind Map',
  sequenceDiagram: 'Sequence Diagram',
  classDiagram: 'Class Diagram',
  stateDiagram: 'State Diagram',
  erDiagram: 'ER Diagram',
  timeline: 'Timeline',
};

function buildPrompt(transcript: string, options: DiagramGenerationOptions = {}): string {
  const { diagramType = 'flowchart', direction = 'TD', language = 'en' } = options;

  const typeLabel = DIAGRAM_TYPE_LABELS[diagramType];

  const baseInstructions = [
    `You are an expert in creating diagrams using Mermaid.js syntax (v11+).`,
    `Based on the following video transcript, create a comprehensive ${typeLabel} that summarizes the key concepts, relationships, and flow of information.`,
    `Language for labels: ${language === 'es' ? 'Spanish' : 'English'}.`,
    '',
  ];

  const typeSpecificInstructions: Record<DiagramType, string[]> = {
    flowchart: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      `1. Start with "flowchart ${direction}".`,
      '2. Use simple alphanumeric IDs for nodes (e.g., A, B, C1, node1).',
      '3. ALWAYS enclose node labels in double quotes: A["Label Text"].',
      '4. Use different node shapes to convey meaning:',
      '   - Rectangle: A["Process step"]',
      '   - Rounded: A("Rounded step")',
      '   - Stadium: A(["Stadium shape"])',
      '   - Diamond (decision): A{"Decision?"}',
      '   - Hexagon: A{{"Preparation"}}',
      '5. Use appropriate arrow types:',
      '   - Normal: A --> B',
      '   - With label: A -->|"label"| B',
      '   - Dotted: A -.-> B',
      '   - Thick: A ==> B',
      '6. Group related nodes with subgraph blocks:',
      '   subgraph Title["Section Name"]',
      '     A --> B',
      '   end',
      '7. Use 8-15 nodes for clarity. Max 25 nodes.',
      '8. Escape special characters in labels or avoid them entirely.',
    ],
    mindmap: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'mindmap' on the first line.",
      '2. Use indentation (2 spaces) to define hierarchy.',
      '3. Root node is the main topic of the transcript.',
      '4. Use 3-6 main branches for key topics.',
      '5. Each branch can have 2-4 sub-items.',
      '6. Keep labels concise (2-5 words per node).',
      '7. Example structure:',
      '   mindmap',
      '     root((Main Topic))',
      '       Branch 1',
      '         Detail A',
      '         Detail B',
      '       Branch 2',
      '         Detail C',
    ],
    sequenceDiagram: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'sequenceDiagram'.",
      '2. Define participants/actors at the top.',
      '3. Use proper message syntax:',
      '   - Solid line: A->>B: Message',
      '   - Dashed line: A-->>B: Response',
      '   - Solid arrow: A-)B: Async',
      '4. Use activation boxes: activate/deactivate',
      '5. Use alt/else/end for conditional flows.',
      '6. Use loop/end for repeated interactions.',
      '7. Use Note right of A: text for annotations.',
      '8. Identify the key actors/systems from the transcript.',
      '9. Map the flow of interactions/processes discussed.',
    ],
    classDiagram: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'classDiagram'.",
      '2. Define classes with attributes and methods:',
      '   class ClassName {',
      '     +String attribute',
      '     +method() ReturnType',
      '   }',
      '3. Use proper relationship arrows:',
      '   - Inheritance: A <|-- B',
      '   - Composition: A *-- B',
      '   - Aggregation: A o-- B',
      '   - Association: A --> B',
      '   - Dependency: A ..> B',
      '4. Extract key concepts as classes and their relationships from the transcript.',
      '5. Use meaningful class names and attributes.',
    ],
    stateDiagram: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'stateDiagram-v2'.",
      '2. Define states and transitions:',
      '   [*] --> State1',
      '   State1 --> State2: event',
      '   State2 --> [*]',
      '3. Use composite states for grouping:',
      '   state StateName {',
      '     [*] --> SubState',
      '   }',
      '4. Use notes: note right of State1: description',
      '5. Use choice: state choice <<choice>>',
      '6. Extract states/phases/stages from the transcript content.',
    ],
    erDiagram: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'erDiagram'.",
      '2. Define entities and relationships:',
      '   ENTITY1 ||--o{ ENTITY2 : "relationship"',
      '3. Cardinality notation:',
      '   - ||--|| : one to one',
      '   - ||--o{ : one to many',
      '   - o{--o{ : many to many',
      '4. Add attributes to entities:',
      '   ENTITY {',
      '     string name',
      '     int id PK',
      '   }',
      '5. Extract key concepts as entities and map their relationships from the transcript.',
    ],
    timeline: [
      'DIAGRAM TYPE & SYNTAX RULES:',
      "1. Start with 'timeline'.",
      '2. Optionally add a title: title Timeline Title',
      '3. Define sections and events:',
      '   section Phase 1',
      '     Event 1 : Description',
      '     Event 2 : Description',
      '   section Phase 2',
      '     Event 3 : Description',
      '4. Extract chronological events or phases from the transcript.',
      '5. Keep event descriptions brief (3-8 words).',
    ],
  };

  const outputRules = [
    '',
    'OUTPUT RULES:',
    '- Return ONLY the Mermaid.js code. No markdown code fences (```mermaid).',
    '- No explanations, comments, or additional text.',
    '- Ensure the code is syntactically valid Mermaid.js.',
    '- Do NOT use special characters that break Mermaid syntax (e.g., unquoted brackets, ampersands).',
    '- Keep the diagram readable and well-structured.',
    '',
    'Transcript:',
    transcript.substring(0, 30000),
  ];

  return [
    ...baseInstructions,
    ...typeSpecificInstructions[diagramType],
    ...outputRules,
  ].join('\n');
}

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
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });
  }

  static async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('API Key validation failed:', error);
      return false;
    }
  }

  async generateDiagramCode(
    transcript: string,
    options: DiagramGenerationOptions = {},
  ): Promise<string | null> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please set your API key in settings.');
    }

    const prompt = buildPrompt(transcript, options);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown fences if present
      text = text
        .replace(/^```(?:mermaid)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      return text;
    } catch (error) {
      console.error('Error generating diagram:', error);
      throw error;
    }
  }
}

export default GeminiService;
