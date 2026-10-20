import { AxiosRequestConfig } from 'axios';
import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { modelsApiConfig } from './config';
import { AIModel } from './models';

export class ModelsService {
  public async get(requestOptions?: Pick<AxiosRequestConfig, 'timeout'>): Promise<Array<AIModel>> {
    const response = await getApiService().get(`${modelsApiConfig.route}`, undefined, requestOptions);

    return plainToInstance(AIModel, response.data);
  }
}

export const modelsService = new ModelsService();
