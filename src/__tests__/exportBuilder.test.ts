/// <reference types="vitest/globals" />
import { DiagramExportBuilder } from '@/services/diagram/exportBuilder.service';
import type { ImageExportConfig } from '@/services/diagram/exportBuilder.service';

describe('DiagramExportBuilder', () => {
  let builder: DiagramExportBuilder;

  beforeEach(() => {
    builder = new DiagramExportBuilder();
  });

  describe('default config', () => {
    it('should return default config when build is called without setters', () => {
      const config = builder.build();
      expect(config).toEqual({
        format: 'png',
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        filename: 'diagram.png',
      });
    });

    it('should return a copy of the config, not the original reference', () => {
      const config1 = builder.build();
      const config2 = builder.build();
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('setFormat', () => {
    it.each<['png' | 'svg' | 'pdf', string]>([
      ['png', 'diagram.png'],
      ['svg', 'diagram.svg'],
      ['pdf', 'diagram.pdf'],
    ])(
      'should set format to %s and update default filename to %s',
      (format, expectedFilename) => {
        const config = builder.setFormat(format).build();
        expect(config.format).toBe(format);
        expect(config.filename).toBe(expectedFilename);
      },
    );

    it('should update extension on custom filename when format changes', () => {
      const config = builder.setFilename('my-export').setFormat('svg').build();
      expect(config.filename).toBe('my-export.svg');
    });

    it('should replace existing extension on custom filename', () => {
      const config = builder.setFilename('report.png').setFormat('pdf').build();
      expect(config.filename).toBe('report.pdf');
    });
  });

  describe('setBackgroundColor', () => {
    it('should set a custom background color', () => {
      const config = builder.setBackgroundColor('#000000').build();
      expect(config.backgroundColor).toBe('#000000');
    });

    it('should accept any string as background color', () => {
      const config = builder.setBackgroundColor('transparent').build();
      expect(config.backgroundColor).toBe('transparent');
    });
  });

  describe('setPixelRatio', () => {
    it('should set pixel ratio within valid range', () => {
      const config = builder.setPixelRatio(2).build();
      expect(config.pixelRatio).toBe(2);
    });

    it('should clamp pixel ratio to minimum of 1', () => {
      const config = builder.setPixelRatio(0).build();
      expect(config.pixelRatio).toBe(1);
    });

    it('should clamp negative pixel ratio to 1', () => {
      const config = builder.setPixelRatio(-5).build();
      expect(config.pixelRatio).toBe(1);
    });

    it('should clamp pixel ratio to maximum of 5', () => {
      const config = builder.setPixelRatio(10).build();
      expect(config.pixelRatio).toBe(5);
    });

    it('should allow boundary values 1 and 5', () => {
      expect(builder.setPixelRatio(1).build().pixelRatio).toBe(1);
      builder = new DiagramExportBuilder();
      expect(builder.setPixelRatio(5).build().pixelRatio).toBe(5);
    });
  });

  describe('setFilename', () => {
    it('should set filename with the correct extension based on current format', () => {
      const config = builder.setFilename('my-diagram').build();
      expect(config.filename).toBe('my-diagram.png');
    });

    it('should replace an existing extension with the current format extension', () => {
      const config = builder.setFormat('svg').setFilename('export.txt').build();
      expect(config.filename).toBe('export.svg');
    });

    it('should handle filenames with dots in the name', () => {
      const config = builder.setFilename('my.report.v2').build();
      // replaces last extension
      expect(config.filename).toBe('my.report.png');
    });
  });

  describe('fluent chaining', () => {
    it('should support chaining all setters', () => {
      const config = builder
        .setFormat('pdf')
        .setBackgroundColor('#333333')
        .setPixelRatio(4)
        .setFilename('final-export')
        .build();

      expect(config).toEqual<ImageExportConfig>({
        format: 'pdf',
        backgroundColor: '#333333',
        pixelRatio: 4,
        filename: 'final-export.pdf',
      });
    });

    it('should allow overriding values by calling setters multiple times', () => {
      const config = builder
        .setFormat('svg')
        .setFormat('pdf')
        .setBackgroundColor('red')
        .setBackgroundColor('blue')
        .build();

      expect(config.format).toBe('pdf');
      expect(config.backgroundColor).toBe('blue');
    });
  });
});
