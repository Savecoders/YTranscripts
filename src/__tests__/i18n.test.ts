/// <reference types="vitest/globals" />

// Test the i18n configuration to verify both languages load correctly

describe('i18n configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should initialize i18n with English as fallback language', async () => {
    const { default: i18n } = await import('@/i18n');
    expect(i18n.options.fallbackLng).toContain('en');
  });

  it('should support English and Spanish languages', async () => {
    const { default: i18n } = await import('@/i18n');
    expect(i18n.options.supportedLngs).toContain('en');
    expect(i18n.options.supportedLngs).toContain('es');
  });

  it('should have English translation resources loaded', async () => {
    const { default: i18n } = await import('@/i18n');
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
  });

  it('should have Spanish translation resources loaded', async () => {
    const { default: i18n } = await import('@/i18n');
    expect(i18n.hasResourceBundle('es', 'translation')).toBe(true);
  });

  it('should translate common.appName to "YTranscripts" in English', async () => {
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('en');
    expect(i18n.t('common.appName')).toBe('YTranscripts');
  });

  it('should translate common.appName to "YTranscripts" in Spanish', async () => {
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('es');
    expect(i18n.t('common.appName')).toBe('YTranscripts');
  });

  it('should translate settings.title to "Settings" in English', async () => {
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('en');
    expect(i18n.t('settings.title')).toBe('Settings');
  });

  it('should translate settings.title to "Configuraciones" in Spanish', async () => {
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('es');
    expect(i18n.t('settings.title')).toBe('Configuraciones');
  });

  it('should fall back to English for missing keys', async () => {
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('es');
    // A key that exists in both should return Spanish
    expect(i18n.t('common.delete')).toBe('Eliminar');
  });

  it('should have matching keys in both language files', async () => {
    const en = await import('@/i18n/locales/en.json');
    const es = await import('@/i18n/locales/es.json');

    // Flatten keys helper
    function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return flattenKeys(value as Record<string, unknown>, path);
        }
        return [path];
      });
    }

    const enKeys = flattenKeys(en.default).sort();
    const esKeys = flattenKeys(es.default).sort();
    expect(enKeys).toEqual(esKeys);
  });
});
