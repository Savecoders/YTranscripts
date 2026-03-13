import { Box, VStack, Heading, Text, HStack, IconButton } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TranscriptEntry } from '@/services/storage/storage.service';
import { LuSettings, LuTrash2, LuVideo } from 'react-icons/lu';

interface SidebarProps {
  history: TranscriptEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  history,
  selectedId,
  onSelect,
  onDelete,
  onOpenSettings,
}: SidebarProps) {
  const { t } = useTranslation();

  return (
    <Box
      w="300px"
      bg="bg.panel"
      borderRightWidth="1px"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box p={4} borderBottomWidth="1px">
        <HStack justifyContent="space-between">
          <Heading color={'fg'} size="md">
            {t('sidebar.history')}
          </Heading>
          <IconButton
            aria-label={t('common.settings')}
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
          >
            <LuSettings />
          </IconButton>
        </HStack>
      </Box>

      <VStack flex="1" overflowY="auto" align="stretch" p={2} gap={1}>
        {history.length === 0 && (
          <Text p={4} color="gray.500" fontSize="sm" textAlign="center">
            {t('sidebar.noSavedTranscripts')}
          </Text>
        )}
        {history.map((item) => (
          <HStack
            key={item.id}
            p={2}
            borderRadius="md"
            cursor="pointer"
            bg={selectedId === item.id ? 'colorPalette.subtle' : 'transparent'}
            _hover={{
              bg: selectedId === item.id ? 'colorPalette.subtle' : 'bg.subtle',
            }}
            onClick={() => onSelect(item.id)}
            justifyContent="space-between"
            data-group
          >
            <HStack overflow="hidden">
              <Box color="fg.muted">
                <LuVideo />
              </Box>
              <VStack color={'inherit'} align="start" gap={0} overflow="hidden">
                <Text color={'fg'} fontSize="sm" fontWeight="medium" truncate w="180px">
                  {item.title}
                </Text>
                <Text color={'fg.subtle'} fontSize="xs">
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
            <IconButton
              aria-label={t('sidebar.deleteAriaLabel')}
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              opacity={0}
              _groupHover={{ opacity: 1 }}
            >
              <LuTrash2 />
            </IconButton>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
