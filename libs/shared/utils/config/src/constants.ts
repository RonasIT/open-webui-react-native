import { LanguageCode } from './enums';

export const constants = {
  defaultLocale: LanguageCode.ENGLISH,
};

export const availableLanguages = [{ code: LanguageCode.ENGLISH, label: 'English' }] as const;
