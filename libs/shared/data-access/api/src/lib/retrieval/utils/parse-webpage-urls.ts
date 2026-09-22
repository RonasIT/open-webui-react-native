export function parseWebpageUrls(value: string): Array<string> {
  const urls = value
    .split('\n')
    .map((url) => url.trim())
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
