import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { resolveServerUrl } from '@open-webui-react-native/shared/utils/files';

export interface ServerImageSource {
  uri: string;
  headers?: Record<string, string>;
}

export const getServerImageSource = (source: string): ServerImageSource => {
  const uri = resolveServerUrl(source);
  const token = appStorageService.token.get();
  const isServerUrl = uri.startsWith(`${getApiUrl()}/`);

  return isServerUrl && token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
};
