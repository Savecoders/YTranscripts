import {
  CloseButton,
  Dialog,
  Portal,
} from "@chakra-ui/react"
import { ReactNode } from 'react';

interface CustomDialogProps {
  placement?: "top" | "center" | "bottom";
  children: ReactNode;
}

interface CustomDialogTriggerProps {
  children: ReactNode;
}

interface CustomDialogContentProps {
  title: string;
  children: ReactNode;
}

interface CustomDialogBodyProps {
  children: ReactNode;
}

interface CustomDialogFooterProps {
  children: ReactNode;
}

export const CustomDialog = ({ placement = "center", children }: CustomDialogProps) => {
  return (
    <Dialog.Root placement={placement} motionPreset="slide-in-bottom">
      {children}
    </Dialog.Root>
  );
};

CustomDialog.Trigger = ({ children }: CustomDialogTriggerProps) => (
  <Dialog.Trigger asChild>
    {children}
  </Dialog.Trigger>
);

CustomDialog.Content = ({ title, children }: CustomDialogContentProps) => (
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        {children}
        <Dialog.CloseTrigger asChild>
          <CloseButton size="sm" />
        </Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
);

CustomDialog.Body = ({ children }: CustomDialogBodyProps) => (
  <Dialog.Body>{children}</Dialog.Body>
);

CustomDialog.Footer = ({ children }: CustomDialogFooterProps) => (
  <Dialog.Footer>{children}</Dialog.Footer>
);
