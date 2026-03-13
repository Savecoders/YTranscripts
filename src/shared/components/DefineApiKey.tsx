import { useState, useEffect } from 'react';
import { Button, Input, Text, Dialog, Stack, Field } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        title: t('apiKey.savedSuccess'),
        type: 'success',
      });
    } else {
      toaster.create({
        title: t('apiKey.invalidKey'),
        type: 'error',
      });
    }
  };

  return (
    <CustomDialog placement="center">
      <CustomDialog.Trigger>
        <Button variant="outline">
          <LuKey /> {t('apiKey.configureButton')}
        </Button>
      </CustomDialog.Trigger>

      <CustomDialog.Content title={t('apiKey.dialogTitle')}>
        <CustomDialog.Body>
          <Stack align="stretch" gap={6}>
            <Field.Root>
              <Field.Label mb={2} fontWeight="medium">
                {t('apiKey.fieldLabel')}
              </Field.Label>
              <InputGroup startElement={<LuKey />}>
                <Input
                  placeholder={t('apiKey.placeholder')}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  type="password"
                />
              </InputGroup>
              <Text fontSize="xs" color="fg.muted" mt={1}>
                {t('apiKey.helperText')}
              </Text>
            </Field.Root>
          </Stack>
        </CustomDialog.Body>

        <CustomDialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </Dialog.ActionTrigger>
          <Button
            colorScheme="teal"
            onClick={handleSave}
            disabled={!inputKey || isSaving || isValidating}
            loading={isSaving || isValidating}
          >
            {t('apiKey.saveButton')}
          </Button>
        </CustomDialog.Footer>
      </CustomDialog.Content>
    </CustomDialog>
  );
}
