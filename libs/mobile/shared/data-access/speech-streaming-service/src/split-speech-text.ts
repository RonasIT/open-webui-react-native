const sentenceEndings = ['. ', '! ', '? ', '\n'];

const getCutIndex = (text: string, maxLength: number): number => {
  const head = text.slice(0, maxLength);
  const sentenceEndIndex = Math.max(...sentenceEndings.map((ending) => head.lastIndexOf(ending)));

  if (sentenceEndIndex > 0) {
    return sentenceEndIndex + 1;
  }

  const spaceIndex = head.lastIndexOf(' ');

  return spaceIndex > 0 ? spaceIndex : maxLength;
};

// NOTE: Android throws on Speech.speak input longer than Speech.maxSpeechInputLength, so long text is spoken in parts
export const splitSpeechText = (text: string, maxLength: number): Array<string> => {
  const parts: Array<string> = [];
  let restText = text;

  while (restText.length > maxLength) {
    const cutIndex = getCutIndex(restText, maxLength);
    parts.push(restText.slice(0, cutIndex));
    restText = restText.slice(cutIndex);
  }

  parts.push(restText);

  return parts.filter((part) => part.trim());
};
