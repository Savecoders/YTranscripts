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
    filename: 'diagram',
  };

  setFormat(format: 'png' | 'svg' | 'pdf'): this {
    this.config.format = format;
    this.config.filename = `diagram.${format}`;
    return this;
  }

  setBackgroundColor(color: string): this {
    this.config.backgroundColor = color;
    return this;
  }

  setPixelRatio(ratio: number): this {
    this.config.pixelRatio = ratio;
    return this;
  }

  setFilename(name: string): this {
    this.config.filename = name;
    return this;
  }

  build(): ImageExportConfig {
    return { ...this.config };
  }
}
