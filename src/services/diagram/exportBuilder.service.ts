export interface ImageExportConfig {
  format: 'png' | 'svg' | 'pdf';
  backgroundColor: string;
  pixelRatio?: number;
  filename: string;
}

export class DiagramExportBuilder {
  private config: ImageExportConfig = {
    format: 'png',
    backgroundColor: '#ffffff',
    pixelRatio: 3,
    filename: 'diagram.png',
  };

  setFormat(format: 'png' | 'svg' | 'pdf'): this {
    this.config.format = format;
    if (this.config.filename.startsWith('diagram.')) {
      this.config.filename = `diagram.${format}`;
    } else {
      const baseName = this.config.filename.replace(/\.[^.]+$/, '');
      this.config.filename = `${baseName}.${format}`;
    }
    return this;
  }

  setBackgroundColor(color: string): this {
    this.config.backgroundColor = color;
    return this;
  }

  setPixelRatio(ratio: number): this {
    this.config.pixelRatio = Math.max(1, Math.min(5, ratio));
    return this;
  }

  setFilename(name: string): this {
    const ext = this.config.format;
    const baseName = name.replace(/\.[^.]+$/, '');
    this.config.filename = `${baseName}.${ext}`;
    return this;
  }

  build(): ImageExportConfig {
    return { ...this.config };
  }
}
