import { useRef, useCallback, useEffect, useState } from 'react';
import { Box, HStack, Text, IconButton } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuMaximize2, LuMinimize2, LuCopy, LuCheck } from 'react-icons/lu';
import { useColorMode } from '@/shared/hooks/useColorMode';
import type { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface MermaidEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  error?: string | null;
}

export function MermaidEditor({
  value,
  onChange,
  height = '250px',
  error,
}: MermaidEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { colorMode } = useColorMode();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMount: OnMount = useCallback((editorInstance, monaco) => {
    editorRef.current = editorInstance;

    const languages = monaco.languages.getLanguages();
    const hasMermaid = languages.some((l: { id: string }) => l.id === 'mermaid');

    if (!hasMermaid) {
      monaco.languages.register({ id: 'mermaid' });

      monaco.languages.setMonarchTokensProvider('mermaid', {
        keywords: [
          'graph',
          'flowchart',
          'sequenceDiagram',
          'classDiagram',
          'stateDiagram',
          'stateDiagram-v2',
          'erDiagram',
          'gantt',
          'pie',
          'gitGraph',
          'mindmap',
          'timeline',
          'sankey-beta',
          'subgraph',
          'end',
          'participant',
          'actor',
          'loop',
          'alt',
          'else',
          'opt',
          'par',
          'and',
          'critical',
          'break',
          'rect',
          'note',
          'over',
          'activate',
          'deactivate',
          'section',
          'title',
          'class',
          'click',
          'callback',
          'link',
          'style',
          'classDef',
          'direction',
        ],
        directions: ['TB', 'TD', 'BT', 'RL', 'LR'],
        arrows: [
          '-->',
          '---',
          '-.->',
          '-.->',
          '==>',
          '-->>',
          '-->>',
          '->>',
          '-->|',
          '--|',
          '==>',
          '-->',
        ],
        tokenizer: {
          root: [
            // Comments
            [/%%.*$/, 'comment'],
            // Strings
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            // Arrows and connections (before keywords to avoid conflicts)
            [/-->>|-->>|-->|---|-\.->|==>|<\|--|o--|--o|\*--|\|--|--\||\|\|/, 'operator'],
            // Directions
            [/\b(TB|TD|BT|RL|LR)\b/, 'keyword.direction'],
            // Keywords
            [
              /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|mindmap|timeline|sankey-beta)\b/,
              'keyword.type',
            ],
            [
              /\b(subgraph|end|participant|actor|loop|alt|else|opt|par|and|critical|break|rect|note|over|activate|deactivate|section|title|class|click|callback|link|style|classDef|direction)\b/,
              'keyword',
            ],
            // Node IDs (alphanumeric at start of connections)
            [/\b[A-Z][A-Za-z0-9_]*\b/, 'variable'],
            [/\b[a-z][A-Za-z0-9_]*\b/, 'identifier'],
            // Numbers
            [/\b\d+\b/, 'number'],
            // Brackets and shapes
            [/[[\]{}()]+/, 'delimiter.bracket'],
            // Pipe labels
            [/\|[^|]*\|/, 'string.label'],
            // Colons
            [/:/, 'delimiter'],
          ],
        },
      });

      monaco.languages.setLanguageConfiguration('mermaid', {
        comments: { lineComment: '%%' },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
      });
    }
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => editorRef.current?.layout(), 50);
    }
  }, [expanded]);

  const editorHeight = expanded ? '500px' : height;

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      borderColor={error ? 'red.500' : 'border.default'}
    >
      {/* Toolbar */}
      <HStack
        px={3}
        py={1.5}
        bg="bg.muted"
        justifyContent="space-between"
        borderBottomWidth="1px"
      >
        <Text fontSize="xs" fontWeight="medium" color="fg.muted">
          {t('editor.title')}
        </Text>
        <HStack gap={1}>
          <IconButton
            aria-label={t('editor.copyCode')}
            size="2xs"
            variant="ghost"
            onClick={handleCopy}
          >
            {copied ? <LuCheck /> : <LuCopy />}
          </IconButton>
          <IconButton
            aria-label={expanded ? t('editor.collapse') : t('editor.expand')}
            size="2xs"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <LuMinimize2 /> : <LuMaximize2 />}
          </IconButton>
        </HStack>
      </HStack>

      {/* Editor - Lazy loaded */}
      <MermaidEditorLazy
        value={value}
        height={editorHeight}
        theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
        onMount={handleMount}
        onChange={handleChange}
      />

      {/* Error indicator */}
      {error && (
        <Box
          px={3}
          py={1.5}
          bg="red.50"
          _dark={{ bg: 'red.950' }}
          borderTopWidth="1px"
          borderColor="red.500"
        >
          <Text fontSize="xs" color="red.500" lineClamp={2}>
            {error}
          </Text>
        </Box>
      )}
    </Box>
  );
}

/** Lazy wrapper to dynamically import Monaco */
import { lazy, Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

function MermaidEditorLazy({
  value,
  height,
  theme,
  onMount,
  onChange,
}: {
  value: string;
  height: string;
  theme: string;
  onMount: OnMount;
  onChange: OnChange;
}) {
  return (
    <Suspense
      fallback={
        <Center h={height}>
          <Spinner size="sm" />
        </Center>
      }
    >
      <MonacoEditor
        height={height}
        language="mermaid"
        theme={theme}
        value={value}
        onChange={onChange}
        onMount={onMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          folding: true,
          renderLineHighlight: 'line',
          bracketPairColorization: { enabled: true },
          padding: { top: 8 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
        }}
      />
    </Suspense>
  );
}
