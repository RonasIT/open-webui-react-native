import { plainToInstance } from 'class-transformer';
import { getApiService, RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { appConfigurationApiConfig } from './config';
import { Configuration } from './models';

type GetConfigurationOptions = {
  url?: string;
  skipToast?: boolean;
  skipSentryReport?: boolean;
} & RequestOptions;

export class AppConfigurationService {
  public async get({
    url,
    skipToast,
    skipSentryReport,
    timeout,
  }: GetConfigurationOptions = {}): Promise<Configuration> {
    const data: Configuration = await getApiService(url).get(
      appConfigurationApiConfig.route,
      { skipToast, skipSentryReport },
      {
        withCredentials: true,
        timeout,
      },
    );

    return plainToInstance(Configuration, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}

export const appConfigurationService = new AppConfigurationService();
