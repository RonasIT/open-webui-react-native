import { LanguageCode } from '@open-webui-react-native/shared/utils/config';

const latinPattern = /\p{Script=Latin}/gu;
const cyrillicPattern = /\p{Script=Cyrillic}/gu;
const cjkPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const kanaPattern = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const minLetterCount = 20;

// NOTE: Languages not listed here are written in Latin script
const languagePatterns: Partial<Record<string, RegExp>> = {
  [LanguageCode.RUSSIAN]: cyrillicPattern,
  [LanguageCode.CHINESE]: cjkPattern,
  [LanguageCode.JAPANESE]: cjkPattern,
};

const countLetters = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0;

// NOTE: Fewer letters (e.g. "Docker,") can't tell the language of the reply
export const hasEnoughLettersForSpeechLanguage = (text: string): boolean =>
  countLetters(text, /\p{L}/gu) >= minLetterCount;

const getDominantScriptLanguage = (text: string): LanguageCode | undefined => {
  const latinCount = countLetters(text, latinPattern);
  const cyrillicCount = countLetters(text, cyrillicPattern);
  const cjkCount = countLetters(text, cjkPattern);

  if (!latinCount && !cyrillicCount && !cjkCount) {
    return undefined;
  }

  if (latinCount >= cyrillicCount && latinCount >= cjkCount) {
    return LanguageCode.ENGLISH;
  }

  if (cyrillicCount >= cjkCount) {
    return LanguageCode.RUSSIAN;
  }

  return kanaPattern.test(text) ? LanguageCode.JAPANESE : LanguageCode.CHINESE;
};

// NOTE: Switches only when the text has no letter of the app language's script; Latin languages aren't told apart
export const resolveSpeechLanguage = (text: string, language: string): string => {
  const languagePattern = languagePatterns[language.split('-')[0].toLowerCase()] ?? latinPattern;

  if (!hasEnoughLettersForSpeechLanguage(text) || countLetters(text, languagePattern) > 0) {
    return language;
  }

  return getDominantScriptLanguage(text) ?? language;
};
