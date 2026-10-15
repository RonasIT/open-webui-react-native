// A partial "https:" counts as a scheme, so it is left for the validator to reject instead of being prefixed.
const schemePattern = /^([a-z][a-z\d+.-]*:\/\/|https?:)/i;

export const normalizeServerUrl = (url?: string): string => {
  const trimmedUrl = (url ?? '').trim();

  if (!trimmedUrl) {
    return '';
  }

  const urlWithScheme = schemePattern.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  return urlWithScheme.replace(/\/+$/, '').replace(/(:\/\/[^/]+)\/api$/i, '$1');
};
