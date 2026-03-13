import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, HStack, Box, Spinner, Center, Text, IconButton } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  LuDownload,
  LuFileText,
  LuRefreshCw,
  LuImage,
  LuZoomIn,
  LuZoomOut,
  LuMaximize,
} from 'react-icons/lu';
import { useColorMode } from '@/shared/hooks/useColorMode';
import { DiagramExportBuilder } from '@/services/diagram/exportBuilder.service';
import { DiagramExporter } from '@/services/diagram/diagramExporter.service';

interface DiagramViewerProps {
  code: string;
  title?: string;
  onChange?: (newCode: string) => void;
  onError?: (error: string | null) => void;
}

export function DiagramViewer({ code, title, onChange, onError }: DiagramViewerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const { colorMode } = useColorMode();

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvgContent('');
        setLoading(false);
        setRenderError(null);
        onError?.(null);
        return;
      }

      try {
        setLoading(true);
        setRenderError(null);

        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: colorMode === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: { htmlLabels: true, curve: 'basis' },
          sequence: { mirrorActors: false },
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const { svg } = await mermaid.render(id, code);

        if (!cancelled) {
          setSvgContent(svg);
          setRenderError(null);
          onError?.(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          const cleanMessage = message
            .replace(/^Error: /, '')
            .replace(/\n\n.*$/s, '')
            .slice(0, 200);
          setRenderError(cleanMessage);
          onError?.(cleanMessage);
          setSvgContent('');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Debounce renders to avoid excessive mermaid calls during typing
    const timer = setTimeout(renderDiagram, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, colorMode, onError]);

  const handleDownload = useCallback(
    async (format: 'png' | 'svg' | 'pdf') => {
      if (!containerRef.current || !svgContent) return;

      const bgColor = colorMode === 'dark' ? '#1F2937' : '#ffffff';
      const safeTitle = title
        ? title.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 50)
        : 'diagram';

      try {
        const config = new DiagramExportBuilder()
          .setFormat(format)
          .setBackgroundColor(bgColor)
          .setPixelRatio(3)
          .setFilename(`${safeTitle}.${format}`)
          .build();

        const exporter = new DiagramExporter(containerRef.current, config);
        await exporter.export();
      } catch (err) {
        console.error(`Export ${format} failed:`, err);
      }
    },
    [colorMode, title, svgContent],
  );

  const toggleDirection = useCallback(() => {
    if (!onChange) return;
    let newCode = code;

    // Only replace direction keyword after the diagram type declaration
    const directionPattern = /^(\s*(?:flowchart|graph)\s+)(TD|TB|LR|RL|BT)/m;
    const match = newCode.match(directionPattern);
    if (match) {
      const currentDir = match[2];
      const newDir = currentDir === 'LR' || currentDir === 'RL' ? 'TD' : 'LR';
      newCode = newCode.replace(directionPattern, `$1${newDir}`);
    }

    onChange(newCode);
  }, [code, onChange]);

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(0.25, Math.min(3, prev + delta)));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Wheel zoom on diagram
  useEffect(() => {
    const el = svgWrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.25, Math.min(3, prev + delta)));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <Box width="100%" mt={2}>
      <HStack mb={2} justifyContent="space-between" flexWrap="wrap" gap={2}>
        <HStack gap={1}>
          {onChange && (
            <Button size="xs" variant="ghost" onClick={toggleDirection}>
              <LuRefreshCw /> {t('diagram.rotate')}
            </Button>
          )}
          <HStack gap={0.5}>
            <IconButton
              aria-label={t('diagram.zoomOut')}
              size="2xs"
              variant="ghost"
              onClick={() => handleZoom(-0.2)}
              disabled={zoom <= 0.25}
            >
              <LuZoomOut />
            </IconButton>
            <Button size="2xs" variant="ghost" onClick={resetZoom} fontFamily="mono">
              {Math.round(zoom * 100)}%
            </Button>
            <IconButton
              aria-label={t('diagram.zoomIn')}
              size="2xs"
              variant="ghost"
              onClick={() => handleZoom(0.2)}
              disabled={zoom >= 3}
            >
              <LuZoomIn />
            </IconButton>
            <IconButton
              aria-label={t('diagram.fitToView')}
              size="2xs"
              variant="ghost"
              onClick={resetZoom}
            >
              <LuMaximize />
            </IconButton>
          </HStack>
        </HStack>

        <HStack gap={1}>
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleDownload('svg')}
            disabled={!svgContent}
          >
            <LuImage /> SVG
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleDownload('png')}
            disabled={!svgContent}
          >
            <LuDownload /> PNG
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleDownload('pdf')}
            disabled={!svgContent}
          >
            <LuFileText /> PDF
          </Button>
        </HStack>
      </HStack>

      {/* Diagram container */}
      <Box
        ref={svgWrapperRef}
        bg="bg.panel"
        borderRadius="md"
        overflow="auto"
        minH="200px"
        maxH="600px"
        borderWidth="1px"
        position="relative"
      >
        <Box
          ref={containerRef}
          p={4}
          color="fg.default"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease',
          }}
        >
          {loading ? (
            <Center h="100%" minH="200px">
              <Spinner size="md" />
            </Center>
          ) : renderError ? (
            <Center minH="200px" flexDirection="column" gap={2} p={4}>
              <Text color="red.400" fontSize="sm" fontFamily="mono" textAlign="center">
                {t('diagram.syntaxError')}
              </Text>
              <Text
                color="fg.muted"
                fontSize="xs"
                fontFamily="mono"
                textAlign="center"
                maxW="400px"
                whiteSpace="pre-wrap"
              >
                {renderError}
              </Text>
            </Center>
          ) : svgContent ? (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <Center minH="200px">
              <Text color="fg.muted" fontSize="sm">
                {t('diagram.noDisplay')}
              </Text>
            </Center>
          )}
        </Box>
      </Box>
    </Box>
  );
}
