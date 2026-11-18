import { plainToInstance } from 'class-transformer';
import {
  getApiService,
  getRequestHeaders,
  RequestOptions,
} from '@open-webui-react-native/shared/data-access/api-client';
import { appConfigurationApiConfig } from './config';
import { Configuration } from './models';

type GetConfigurationOptions = {
  url?: string;
  skipToast?: boolean;
  skipSentryReport?: boolean;
  accessPass?: string;
} & RequestOptions;

export class AppConfigurationService {
  public async get({
    url,
    skipToast,
    skipSentryReport,
    timeout,
    accessPass,
  }: GetConfigurationOptions = {}): Promise<Configuration> {
    // NOTE: A URL check targets an address that may not be saved yet, so it carries the connect form's pass, not storage.
    const data: Configuration = await getApiService(url).get(
      appConfigurationApiConfig.route,
      { skipToast, skipSentryReport },
      { timeout, headers: url ? getRequestHeaders(url, { serverUrl: url, accessPass }) : undefined },
    );

    return plainToInstance(Configuration, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}

export const appConfigurationService = new AppConfigurationService();
