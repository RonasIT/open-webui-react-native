export const getConfigPath = (url: string): string => {
  if (!url) return url;

  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  return cleanUrl.includes('/api') ? cleanUrl : `${cleanUrl}/api/`;
};
