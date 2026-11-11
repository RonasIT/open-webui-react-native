const latinLanguages = ['en', 'de', 'fr', 'es', 'pt', 'ro'];

const countLetters = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0;

const getTextLanguage = (text: string, languageCode: string): string | undefined => {
  const latinCount = countLetters(text, /\p{Script=Latin}/gu);
  const cyrillicCount = countLetters(text, /\p{Script=Cyrillic}/gu);
  const cjkCount = countLetters(text, /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu);

  if (!latinCount && !cyrillicCount && !cjkCount) {
    return undefined;
  }

  if (latinCount >= cyrillicCount && latinCount >= cjkCount) {
    return latinLanguages.includes(languageCode) ? languageCode : 'en';
  }

  if (cyrillicCount >= cjkCount) {
    return 'ru';
  }

  return /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text) ? 'ja' : 'zh';
};

// NOTE: Switches to a language that can read the text's script; Latin-script languages aren't told apart
export const resolveSpeechLanguage = (text: string, language: string): string => {
  const languageCode = language.split('-')[0].toLowerCase();
  const textLanguage = getTextLanguage(text, languageCode);

  return !textLanguage || textLanguage === languageCode ? language : textLanguage;
};
