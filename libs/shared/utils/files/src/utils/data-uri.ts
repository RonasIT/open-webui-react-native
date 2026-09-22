export const DATA_URI_PREFIX = 'data:';

export const isDataUri = (source: string): boolean => source.startsWith(DATA_URI_PREFIX);

export const getDataUriMimeType = (source: string): string | undefined => {
  const mimeType = source.slice(DATA_URI_PREFIX.length).split(/[;,]/)[0];

  return mimeType || undefined;
};
