export const getLineCount = (content: string): number => {
  return content ? content.split('\n').length : 0;
};
