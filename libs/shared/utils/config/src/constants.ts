import { LanguageCode } from './enums';

export const constants = {
  defaultLocale: LanguageCode.ENGLISH,
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
