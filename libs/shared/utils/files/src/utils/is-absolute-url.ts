import { isDataUri } from './data-uri';

// NOTE: A data URI or a full link can be shown as is; anything else is a server path or file id.
export const isAbsoluteUrl = (source: string): boolean => isDataUri(source) || source.startsWith('http');
