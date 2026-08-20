import { LanguageCode, MarkdownRenderer } from './enums';

export const constants = {
  defaultLocale: LanguageCode.ENGLISH,
  defaultMarkdownRenderer: MarkdownRenderer.DEFAULT,
};

export const availableLanguages = [
  { code: LanguageCode.ENGLISH, label: 'English' },
  { code: LanguageCode.RUSSIAN, label: 'Русский' },
  { code: LanguageCode.SPANISH, label: 'Español' },
  { code: LanguageCode.PORTUGUESE, label: 'Português' },
  { code: LanguageCode.FRENCH, label: 'Français' },
  { code: LanguageCode.GERMAN, label: 'Deutsch' },
  { code: LanguageCode.CHINESE, label: '中文' },
  { code: LanguageCode.JAPANESE, label: '日本語' },
] as const;

export const availableMarkdownRenderers = [
  { code: MarkdownRenderer.DEFAULT, labelKey: 'TEXT_MARKDOWN_RENDERER_DEFAULT' },
  { code: MarkdownRenderer.NITRO, labelKey: 'TEXT_MARKDOWN_RENDERER_NITRO' },
] as const;
