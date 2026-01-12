import { ImageExportConfig } from './exportBuilder.service';

export class DiagramExporter {
  constructor(private element: HTMLElement, private config: ImageExportConfig) {}

  async export(): Promise<void> {
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
  }

  private async exportPNG(): Promise<void> {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(this.element, {
      backgroundColor: this.config.backgroundColor,
      pixelRatio: this.config.pixelRatio,
    });
    this.download(dataUrl);
  }

  private async exportSVG(): Promise<void> {
    const { toSvg } = await import('html-to-image');
    const dataUrl = await toSvg(this.element, {
      backgroundColor: this.config.backgroundColor,
    });
    this.download(dataUrl);
  }

  private async exportPDF(): Promise<void> {
    const { toPng } = await import('html-to-image');
    const { jsPDF } = await import('jspdf');

    const dataUrl = await toPng(this.element, {
      backgroundColor: this.config.backgroundColor,
      pixelRatio: this.config.pixelRatio,
    });

    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(this.config.filename);
  }

  private download(dataUrl: string): void {
    const link = document.createElement('a');
    link.download = this.config.filename;
    link.href = dataUrl;
    link.click();
  }
}
