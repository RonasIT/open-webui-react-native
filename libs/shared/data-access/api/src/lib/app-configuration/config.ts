export const appConfigurationApiConfig = {
  route: '/config',
  getConfigQueryKey: ['config'],
  getUrlConfigQueryKey: (url: string): Array<string> => ['url-config', url],
  urlConfigRequestTimeout: 10 * 1000,
};
