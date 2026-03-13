import { ClipboardRoot, Stack, Text } from '@chakra-ui/react';
import { ClipboardIconButton } from './clipboard';
import { CSSProperties } from 'react';

interface ClipTranscriptionProps {
  textTranscription: string;
  style?: CSSProperties;
}

export function ClipTranscription({ textTranscription, style }: ClipTranscriptionProps) {
  return (
    <ClipboardRoot maxW="400px" value={textTranscription || ''}>
      <Stack
        direction="row"
        borderRadius={4}
        padding={4}
        borderRightStyle={'solid'}
        borderWidth={1}
        whiteSpace={'wrap'}
        overflow={'hidden'}
        textOverflow={'ellipsis'}
        style={style}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: '112px',
            scrollbarWidth: 'none',
          }}
        >
          <Text color={'gray.500'}>{textTranscription}</Text>
        </div>
        <ClipboardIconButton me="-2" />
      </Stack>
    </ClipboardRoot>
  );
}
