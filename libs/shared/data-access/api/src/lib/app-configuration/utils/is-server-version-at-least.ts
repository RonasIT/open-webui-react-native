import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { appConfigurationApiConfig } from '../config';
import { Configuration } from '../models';

const parseVersion = (version?: string): Array<number> | null => {
  const match = version?.match(/^v?(\d+)\.(\d+)\.(\d+)/);

  return match ? match.slice(1).map(Number) : null;
};

// NOTE: An unknown version is not "at least" anything, so callers fall back to the old-server path.
export const isServerVersionAtLeast = (version: string): boolean => {
  const configuration = queryClient.getQueryData<Configuration>(appConfigurationApiConfig.getConfigQueryKey);
  const server = parseVersion(configuration?.version);
  const target = parseVersion(version);

  if (!server || !target) {
    return false;
  }

  const index = server.findIndex((part, partIndex) => part !== target[partIndex]);

  return index === -1 || server[index] > target[index];
};
