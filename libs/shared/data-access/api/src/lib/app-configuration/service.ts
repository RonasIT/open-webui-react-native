import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { appConfigurationApiConfig } from './config';
import { Configuration } from './models';

export class AppConfigurationService {
  public async get(url?: string, skipToast?: boolean): Promise<Configuration> {
    const data: Configuration = await getApiService(url).get(
      appConfigurationApiConfig.route,
      { skipToast },
      {
        withCredentials: true,
      },
    );

    return plainToInstance(Configuration, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}

export const appConfigurationService = new AppConfigurationService();
