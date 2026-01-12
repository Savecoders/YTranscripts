import { useEffect, useRef, useState } from 'react';
import { Button, HStack, Box, Spinner, Center } from '@chakra-ui/react';
import { LuDownload, LuFileJson, LuRefreshCw, LuImage } from 'react-icons/lu';
import { useColorMode } from '@/shared/hooks/useColorMode';
import { DiagramExportBuilder } from '@/services/diagram/exportBuilder.service';
import { DiagramExporter } from '@/services/diagram/diagramExporter.service';
 
interface DiagramViewerProps {
  code: string;
  onChange?: (newCode: string) => void;
}

export function DiagramViewer({ code, onChange }: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const renderDiagram = async () => {
      if (code) {
        try {
          setLoading(true);
          const { default: mermaid } = await import('mermaid');
          mermaid.initialize({
            startOnLoad: false,
            theme: colorMode === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif',
          });

          const id = `mermaid-${Date.now()}`;
          const { svg } = await mermaid.render(id, code);
          setSvgContent(svg);
        } catch (error) {
          console.error('Mermaid render error:', error);
          setSvgContent(
            `<div style="color:red; font-family:monospace; white-space:pre-wrap;">${error}</div>`,
          );
        } finally {
          setLoading(false);
        }
      }
    };

    renderDiagram();
  }, [code, colorMode]);

  const handleDownload = async (format: 'png' | 'svg' | 'pdf') => {
    if (!containerRef.current) return;

    const bgColor = colorMode === 'dark' ? '#1F2937' : '#ffffff';

    const config = new DiagramExportBuilder()
      .setFormat(format)
      .setBackgroundColor(bgColor)
      .setPixelRatio(3)
      .build();

    const exporter = new DiagramExporter(containerRef.current, config);
    await exporter.export();
  };

  const toggleDirection = () => {
    if (!onChange) return;
    let newCode = code;
    if (newCode.includes('TD')) {
      newCode = newCode.replace(/TD/g, 'LR');
    } else if (newCode.includes('LR')) {
      newCode = newCode.replace(/LR/g, 'TD');
    } else if (newCode.includes('graph')) {
      newCode = newCode.replace(/graph/, 'graph LR');
    }
    onChange(newCode);
  };

  return (
    <Box width='100%' mt={4}>
      <HStack mb={2} justifyContent='flex-end'>
        {onChange && (
          <Button size='sm' variant='ghost' onClick={toggleDirection} mr='auto'>
            <LuRefreshCw /> Rotate Layout
          </Button>
        )}
        <Button size='sm' variant='outline' onClick={() => handleDownload('svg')}>
          <LuImage /> SVG
        </Button>
        <Button size='sm' variant='outline' onClick={() => handleDownload('png')}>
          <LuDownload /> PNG
        </Button>
        <Button size='sm' variant='outline' onClick={() => handleDownload('pdf')}>
          <LuFileJson /> PDF
        </Button>
      </HStack>

      <Box
        ref={containerRef}
        p={4}
        bg='bg.panel'
        borderRadius='md'
        overflow='auto'
        minH='200px'
        borderWidth='1px'
        color='fg.default'
      >
        {loading ? (
          <Center h='100%' minH='200px'>
            <Spinner />
          </Center>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />
        )}
      </Box>
    </Box>
  );
}
