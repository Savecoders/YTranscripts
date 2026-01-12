import { useState } from 'react';
import { Box, Heading, Text, Grid, GridItem, HStack, Textarea, Center } from '@chakra-ui/react';
import { Button } from '@/shared/components/ui/button';
import { TranscriptEntry, StorageService } from '@/services/storage/storage.service';
import GeminiService from '@/services/storage/gemini.service';
import { DiagramViewer } from '@/shared/components/DiagramViewer';
import { LuFileCode, LuCopy, LuTrash2 } from 'react-icons/lu';
import { useTranscriptStore } from '@/store/transcript.store';

interface TranscriptDetailProps {
  video: TranscriptEntry;
}

export function TranscriptDetail({ video }: TranscriptDetailProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramCode, setDiagramCode] = useState(video.diagramCode || '');
  const [editMode, setEditMode] = useState(false);
  
  const { deleteTranscript } = useTranscriptStore();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const settings = await StorageService.getSettings();
      if (!settings.geminiApiKey) {
        alert('Please set your Gemini API Key in Settings.');
        setIsGenerating(false);
        return;
      }

      const geminiService = new GeminiService(settings.geminiApiKey);
      const code = await geminiService.generateDiagramCode(video.transcript);

      if (code) {
        setDiagramCode(code);
        // Save to storage
        await StorageService.updateTranscript(video.id, { diagramCode: code });
      }
    } catch (error) {
      alert('Error generating diagram. Check console.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiagramCode(e.target.value);
  };

  const handleCodeUpdate = (newCode: string) => {
    setDiagramCode(newCode);
    handleSaveCode(newCode);
  };

  const handleSaveCode = async (codeToSave?: string) => {
    const code = codeToSave || diagramCode;
    await StorageService.updateTranscript(video.id, { diagramCode: code });
    setEditMode(false);
  };
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      await deleteTranscript(video.id);
    }
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <HStack justifyContent="space-between" mb={1}>
        <Heading size="lg" truncate maxW="80%">{video.title}</Heading>
        <Button 
            size="sm" 
            variant="ghost" 
            colorPalette="red" 
            onClick={handleDelete}
        >
            <LuTrash2 /> Delete
        </Button>
      </HStack>
      
      <Text color="fg.muted" fontSize="sm" mb={4}>
        <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
      </Text>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} flex="1" overflow="hidden">
        {/* Left: Transcript */}
        <GridItem overflowY="auto" bg="bg.panel" p={4} borderRadius="md" shadow="sm" borderWidth="1px">
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="sm">Transcriptions</Heading>
            <Button size="xs" variant="ghost" onClick={() => navigator.clipboard.writeText(video.transcript)}>
              <LuCopy /> Copy
            </Button>
          </HStack>
          <Text whiteSpace="pre-wrap" fontSize="sm" color="fg.default">
            {video.transcript}
          </Text>
        </GridItem>

        {/* Right: Diagram */}
        <GridItem overflowY="auto" bg="bg.panel" p={4}
          borderRadius="md" shadow="sm" borderWidth="1px" display="flex" flexDirection="column">
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="sm">Concept Map</Heading>
            <HStack>
              {diagramCode && (
                <Button size="xs" variant={editMode ? "solid" : "outline"}
                  onClick={() => editMode ? handleSaveCode() : setEditMode(true)}>
                  {editMode ? "Done Editing" : "Edit Code"}
                </Button>
              )}
              <Button
                size="xs"
                colorScheme="purple"
                onClick={handleGenerate}
                loading={isGenerating}
                loadingText="Generating..."
              >
                <LuFileCode /> {diagramCode ? 'Regenerate' : 'Generate'}
              </Button>
            </HStack>
          </HStack>

          <Box flex="1" display="flex" flexDirection="column">
            {!diagramCode ? (
              <Center flex="1" flexDirection="column" color="gray.400" borderStyle="dashed" borderWidth="2px" borderRadius="md">
                <LuFileCode size="40px" />
                <Text mt={2}>No diagram generated yet.</Text>
                <Button mt={4} size="sm" onClick={handleGenerate}>Generate with Gemini</Button>
              </Center>
            ) : (
              <>
                {editMode && (
                  <Textarea
                    value={diagramCode}
                    onChange={handleCodeChange}
                    fontFamily="monospace"
                    fontSize="xs"
                    h="150px"
                    mb={2}
                    resize="vertical"
                  />
                )}
                <Box flex="1" overflow="auto" borderWidth={editMode ? "1px" : "0px"} borderRadius="md">
                  <DiagramViewer code={diagramCode} onChange={handleCodeUpdate} />
                </Box>
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}