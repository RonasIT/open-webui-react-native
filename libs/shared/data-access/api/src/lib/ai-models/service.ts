import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { modelsApiConfig } from './config';
import { AIModel } from './models';

export class ModelsService {
  public async get(): Promise<Array<AIModel>> {
    const response = await getApiService().get(`${modelsApiConfig.route}`);

    return plainToInstance(AIModel, response.data);
  }
}

export const modelsService = new ModelsService();
