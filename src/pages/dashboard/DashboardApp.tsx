import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Spinner, Center } from '@chakra-ui/react';
import { useTranscriptStore } from '@/store/transcript.store';
import { TranscriptDetail } from '@/shared/components/TranscriptDetail';
import { SettingsDetail } from '@/shared/components/SettingsDetail';
import { Sidebar } from '@/shared/components/Sidebar';

export default function DashboardApp() {
  const [view, setView] = useState<'detail' | 'settings'>('detail');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Store
  const { history, isLoading, loadHistory, deleteTranscript } = useTranscriptStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Select first video if none selected and history exists
  useEffect(() => {
    if (!selectedId && history.length > 0) {
      setSelectedId(history[0].id);
    }
  }, [history, selectedId]);

  const handleSelectVideo = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteTranscript(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedVideo = history.find(h => h.id === selectedId);

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg="bg.subtle">
      {/* Sidebar */}
      <Sidebar
        history={history}
        selectedId={selectedId}
        onSelect={handleSelectVideo}
        onDelete={handleDeleteVideo}
        onOpenSettings={() => setView('settings')}
      />

      <Box flex="1" h="100%" overflowY="auto" p={6}>
        {view === 'settings' ? (
          <SettingsDetail />
        ) : isLoading ? (
          <Center h="100%"><Spinner /></Center>
        ) : selectedVideo ? (
          <TranscriptDetail video={selectedVideo} />
        ) : (
          <Center h="100%" flexDirection="column" color="fg.muted">
            <Heading size="lg" mb={2}>No video selected</Heading>
            <Text>Select a transcript from the sidebar or generate a new one.</Text>
          </Center>
        )}
      </Box>

    </Flex>
  );
}
