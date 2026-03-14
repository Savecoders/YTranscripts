import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Toaster } from './toaster';

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={defaultSystem}>
      {/*<ColorModeProvider>{props.children}</ColorModeProvider>*/}
      {props.children}
      <Toaster />
    </ChakraProvider>
  );
}
