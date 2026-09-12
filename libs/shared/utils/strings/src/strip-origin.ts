// Removes the origin (protocol + host) from an absolute URL, keeping only the path and query string.
export const stripOrigin = (url: string): string => {
  try {
    const { pathname, search } = new URL(url);

    return `${pathname}${search}`;
  } catch {
    return url;
  }
};
