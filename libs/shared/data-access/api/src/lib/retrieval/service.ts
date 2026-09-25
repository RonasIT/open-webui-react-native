import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { retrievalApiConfig } from './config';
import { ProcessUrlRequest, ProcessUrlResponse } from './models';

class RetrievalService {
  public async processUrl(request: ProcessUrlRequest): Promise<ProcessUrlResponse> {
    const response = await getApiService().post<ProcessUrlResponse>(
      `${retrievalApiConfig.route}/process/url`,
      instanceToPlain(request),
    );

    return plainToInstance(ProcessUrlResponse, response);
  }
}

export const retrievalService = new RetrievalService();
