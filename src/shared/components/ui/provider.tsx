import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Toaster } from './toaster';
import { ColorModeProvider } from './color-mode';

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        {props.children}
      </ColorModeProvider>
      <Toaster />
    </ChakraProvider>
  );
}
