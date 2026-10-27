function normalizeWebpageUrl(url: string): string {
  const schemePattern = /^https?:\/\//i;

  return schemePattern.test(url) ? url : `https://${url}`;
}

export function parseWebpageUrls(value: string): Array<string> {
  const urls = value
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean)
    .map(normalizeWebpageUrl)
    .filter((url) => {
      try {
        const parsed = new URL(url);

        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    });

  return [...new Set(urls)];
}
