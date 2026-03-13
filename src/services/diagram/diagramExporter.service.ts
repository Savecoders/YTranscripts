import { ImageExportConfig } from './exportBuilder.service';

export class DiagramExporter {
  constructor(
    private element: HTMLElement,
    private config: ImageExportConfig,
  ) {}

  async export(): Promise<void> {
    try {
      switch (this.config.format) {
        case 'png':
          await this.exportPNG();
          break;
        case 'svg':
          await this.exportSVG();
          break;
        case 'pdf':
          await this.exportPDF();
          break;
      }
    } catch (error) {
      console.error(`Failed to export as ${this.config.format}:`, error);
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async exportPNG(): Promise<void> {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(this.element, {
      backgroundColor: this.config.backgroundColor,
      pixelRatio: this.config.pixelRatio,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        return !node.classList?.contains?.('diagram-toolbar');
      },
    });
    this.download(dataUrl);
  }

  private async exportSVG(): Promise<void> {
    const { toSvg } = await import('html-to-image');
    const dataUrl = await toSvg(this.element, {
      backgroundColor: this.config.backgroundColor,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        return !node.classList?.contains?.('diagram-toolbar');
      },
    });
    this.download(dataUrl);
  }

  private async exportPDF(): Promise<void> {
    const { toPng } = await import('html-to-image');
    const { jsPDF } = await import('jspdf');

    const dataUrl = await toPng(this.element, {
      backgroundColor: this.config.backgroundColor,
      pixelRatio: this.config.pixelRatio,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        return !node.classList?.contains?.('diagram-toolbar');
      },
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const isLandscape = img.width > img.height;
    const orientation = isLandscape ? 'landscape' : 'portrait';

    const pdf = new jsPDF({ orientation });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const padding = 10;
    const availableWidth = pageWidth - padding * 2;
    const availableHeight = pageHeight - padding * 2;

    const imgAspect = img.width / img.height;
    const pageAspect = availableWidth / availableHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > pageAspect) {
      drawWidth = availableWidth;
      drawHeight = availableWidth / imgAspect;
    } else {
      drawHeight = availableHeight;
      drawWidth = availableHeight * imgAspect;
    }

    // Center on page
    const x = padding + (availableWidth - drawWidth) / 2;
    const y = padding + (availableHeight - drawHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', x, y, drawWidth, drawHeight);
    pdf.save(this.config.filename);
  }

  private download(dataUrl: string): void {
    const link = document.createElement('a');
    link.download = this.config.filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
