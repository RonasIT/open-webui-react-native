// NOTE: As in the web client, the edit field shows a marker instead of each `<details>` block, and
// saving puts the original block back.
const DETAILS_BLOCK_REGEX = /<details[\s\S]*?<\/details>/gi;
const DETAILS_MARKER_REGEX = /<details id="__DETAIL_(\d+)__"\/>/g;

export const replaceDetailsWithMarkers = (content: string): string => {
  let index = 0;

  return content.replace(DETAILS_BLOCK_REGEX, () => `<details id="__DETAIL_${index++}__"/>`);
};

export const restoreDetailsFromMarkers = (editedContent: string, originalContent: string): string => {
  const blocks = originalContent.match(DETAILS_BLOCK_REGEX) ?? [];

  return editedContent.replace(DETAILS_MARKER_REGEX, (_, index: string) => blocks[Number(index)] ?? '');
};
