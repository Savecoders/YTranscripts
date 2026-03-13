import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  HStack,
  Center,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { StorageService, TranscriptEntry } from '@/services/storage/storage.service';
import GeminiService, {
  DiagramType,
  DiagramGenerationOptions,
} from '@/services/storage/gemini.service';
import { DiagramViewer } from '@/shared/components/DiagramViewer';
import { MermaidEditor } from '@/shared/components/MermaidEditor';
import { LuFileCode, LuCopy, LuTrash2, LuCode, LuSparkles, LuEye } from 'react-icons/lu';
import { useTranscriptStore } from '@/store/transcript.store';

const DIAGRAM_TYPE_KEYS: DiagramType[] = [
  'flowchart',
  'mindmap',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'erDiagram',
  'timeline',
];

const diagramCollections = createListCollection({
  items: [
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'sequenceDiagram', label: 'Sequence Diagram' },
    { value: 'classDiagram', label: 'Class Diagram' },
    { value: 'stateDiagram', label: 'State Diagram' },
    { value: 'erDiagram', label: 'ER Diagram' },
    { value: 'timeline', label: 'Timeline' },
  ],
});

interface TranscriptDetailProps {
  video: TranscriptEntry;
}

export function TranscriptDetail({ video }: TranscriptDetailProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramCode, setDiagramCode] = useState(video.diagramCode || '');
  const [editMode, setEditMode] = useState(false);
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
  const [editorError, setEditorError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { deleteTranscript, updateTranscript } = useTranscriptStore();

  const debouncedSave = useCallback(
    (code: string) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        updateTranscript(video.id, { diagramCode: code });
      }, 1000);
    },
    [video.id, updateTranscript],
  );

  const handleGenerate = async (type?: DiagramType) => {
    const selectedType = type || diagramType;
    setIsGenerating(true);
    try {
      const settings = await StorageService.getSettings();
      if (!settings.geminiApiKey) {
        alert(t('transcript.apiKeyRequired'));
        setIsGenerating(false);
        return;
      }

      const options: DiagramGenerationOptions = {
        diagramType: selectedType,
        direction: 'TD',
        language: settings.language || 'en',
      };

      const geminiService = new GeminiService(settings.geminiApiKey);
      const code = await geminiService.generateDiagramCode(video.transcript, options);

      if (code) {
        setDiagramCode(code);
        await updateTranscript(video.id, { diagramCode: code });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditorChange = useCallback(
    (newCode: string) => {
      setDiagramCode(newCode);
      debouncedSave(newCode);
    },
    [debouncedSave],
  );

  const handleViewerChange = useCallback(
    (newCode: string) => {
      setDiagramCode(newCode);
      updateTranscript(video.id, { diagramCode: newCode });
    },
    [video.id, updateTranscript],
  );

  const handleDelete = async () => {
    if (confirm(t('transcript.deleteConfirm'))) {
      await deleteTranscript(video.id);
    }
  };

  const handleDiagramError = useCallback((error: string | null) => {
    setEditorError(error);
  }, []);

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <HStack justifyContent="space-between" mb={1}>
        <Heading color={'red.400'} size="lg" truncate maxW="80%">
          {video.title}
        </Heading>
        <Button size="sm" variant="ghost" colorPalette="red" onClick={handleDelete}>
          <LuTrash2 /> {t('common.delete')}
        </Button>
      </HStack>

      <Text color="fg.muted" fontSize="sm" mb={4}>
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          {video.url}
        </a>
      </Text>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} flex="1" overflow="hidden">
        <GridItem
          overflowY="auto"
          bg="bg.panel"
          p={4}
          borderRadius="md"
          shadow="sm"
          borderWidth="1px"
        >
          <HStack justifyContent="space-between" mb={2}>
            <Heading color={'initial'} size="sm">
              {t('transcript.transcriptions')}
            </Heading>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => navigator.clipboard.writeText(video.transcript)}
            >
              <LuCopy /> {t('common.copy')}
            </Button>
          </HStack>
          <Text whiteSpace="pre-wrap" fontSize="sm" color="gray.500">
            {video.transcript}
          </Text>
        </GridItem>

        <GridItem
          overflowY="auto"
          bg="bg.panel"
          p={4}
          borderRadius="md"
          shadow="sm"
          borderWidth="1px"
          display="flex"
          flexDirection="column"
        >
          <HStack justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
            <Heading size="sm">{t('transcript.conceptMap')}</Heading>
            <HStack gap={2} flexWrap="wrap">
              <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                <Select.Root
                  color={'fg'}
                  collection={diagramCollections}
                  defaultValue={['flowchart']}
                  size="sm"
                  width="320px"
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select a Diagram Style" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.ClearTrigger />
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content color={'gray.400'}>
                        {diagramCollections.items.map((diagram) => (
                          <Select.Item item={diagram} key={diagram.value}>
                            {diagram.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>
              <Button
                size="xs"
                variant="outline"
                onClick={() => handleGenerate()}
                loading={isGenerating}
                loadingText={t('transcript.generating')}
              >
                <LuSparkles /> {t('transcript.regenerate')}
              </Button>
              {diagramCode && (
                <Button
                  size="xs"
                  variant={editMode ? 'solid' : 'outline'}
                  onClick={() => setEditMode((prev) => !prev)}
                >
                  {editMode ? <LuEye /> : <LuCode />}{' '}
                  {editMode ? t('transcript.preview') : t('transcript.editCode')}
                </Button>
              )}
            </HStack>
          </HStack>
          <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
            {!diagramCode ? (
              <Center
                flex="1"
                flexDirection="column"
                color="gray.400"
                borderStyle="dashed"
                borderWidth="2px"
                borderRadius="md"
                gap={2}
                p={8}
              >
                <LuFileCode size="40px" />
                <Text mt={2} textAlign="center">
                  {t('transcript.noDiagramYet')}
                </Text>
                <Text fontSize="xs" color="fg.muted" textAlign="center">
                  {t('transcript.noDiagramDesc')}
                </Text>
                <HStack mt={4} flexWrap="wrap" gap={2}>
                  {DIAGRAM_TYPE_KEYS.slice(0, 4).map((dt) => (
                    <Button
                      key={dt}
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setDiagramType(dt);
                        handleGenerate(dt);
                      }}
                    >
                      <LuSparkles /> {t(`diagramTypes.${dt}`)}
                    </Button>
                  ))}
                </HStack>
              </Center>
            ) : (
              <Box flex="1" display="flex" flexDirection="column" overflow="auto" gap={3}>
                {editMode && (
                  <MermaidEditor
                    value={diagramCode}
                    onChange={handleEditorChange}
                    height="220px"
                    error={editorError}
                  />
                )}
                <Box flex="1" overflow="auto">
                  <DiagramViewer
                    code={diagramCode}
                    title={video.title}
                    onChange={handleViewerChange}
                    onError={handleDiagramError}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
