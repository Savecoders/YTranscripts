import { useState, useEffect } from 'react';
import { Button, Input, Text, Dialog, Stack, Field } from '@chakra-ui/react';
import { InputGroup } from '@/shared/components/ui/input-group';
import { LuKey } from 'react-icons/lu';
import { CustomDialog } from './ui/dialog';
import GeminiService from '@/services/storage/gemini.service';
import { toaster } from '../constants/toaster';

interface DefineApiKeyProps {
  initialApiKey: string;
  onSave: (apiKey: string) => Promise<boolean>;
}

export function DefineApiKey({ initialApiKey, onSave }: DefineApiKeyProps) {
  const [inputKey, setInputKey] = useState(initialApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputKey(initialApiKey);
  }, [initialApiKey]);

  const handleSave = async () => {
    setIsValidating(true);
    const isValid = await GeminiService.validateApiKey(inputKey);
    setIsValidating(false);

    if (isValid) {
      setIsSaving(true);
      await onSave(inputKey);
      setIsSaving(false);
      toaster.create({
        title: 'Apki key de gemini guardada exitosamente',
        type: 'success',
      });
    } else {
      toaster.create({
        title: 'La Api key ingresada no es valida porfavor revise ...',
        type: 'error',
      });
    }
  };

  return (
    <CustomDialog placement='center'>
      <CustomDialog.Trigger>
        <Button variant='outline'>
          <LuKey /> Configure API Key
        </Button>
      </CustomDialog.Trigger>

      <CustomDialog.Content title='Configure API Key'>
        <CustomDialog.Body>
          <Stack align='stretch' gap={6}>
            <Field.Root>
              <Field.Label mb={2} fontWeight='medium'>
                Gemini API Key
              </Field.Label>
              <InputGroup startElement={<LuKey />}>
                <Input
                  placeholder='Enter your Gemini API Key'
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  type='password'
                />
              </InputGroup>
              <Text fontSize='xs' color='fg.muted' mt={1}>
                Required to generate diagrams.
              </Text>
            </Field.Root>
          </Stack>
        </CustomDialog.Body>

        <CustomDialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant='outline'>Cancel</Button>
          </Dialog.ActionTrigger>
          <Button
            colorScheme='teal'
            onClick={handleSave}
            disabled={!inputKey || isSaving || isValidating}
            loading={isSaving || isValidating}
          >
            Save Key
          </Button>
        </CustomDialog.Footer>
      </CustomDialog.Content>
    </CustomDialog>
  );
}
