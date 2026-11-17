import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { isServerVersionAtLeast } from '../app-configuration/utils/is-server-version-at-least';
import { retrievalApiConfig } from './config';
import { ProcessUrlType } from './enums';
import { ProcessUrlRequest, ProcessUrlResponse, ProcessWebResponse } from './models';

class RetrievalService {
  public async processUrl(request: ProcessUrlRequest): Promise<ProcessUrlResponse> {
    // NOTE: Open WebUI 0.10.0–0.11.0 has no /process/url; remove with 0.11.0 support.
    if (!isServerVersionAtLeast('0.11.1')) {
      return this.processWeb(request);
    }

    // NOTE: A failed URL becomes an error chip in the attachments, so no toast.
    const response = await getApiService().post<ProcessUrlResponse>(
      `${retrievalApiConfig.route}/process/url`,
      instanceToPlain(request),
      { params: { skipToast: true } },
    );

    return plainToInstance(ProcessUrlResponse, response);
  }

  private async processWeb(request: ProcessUrlRequest): Promise<ProcessUrlResponse> {
    const response = plainToInstance(
      ProcessWebResponse,
      await getApiService().post<ProcessWebResponse>(
        `${retrievalApiConfig.route}/process/web`,
        instanceToPlain(request),
        {
          params: { skipToast: true },
        },
      ),
      { excludeExtraneousValues: true, enableImplicitConversion: true },
    );

    return new ProcessUrlResponse({
      status: response.status,
      type: ProcessUrlType.WEB,
      name: request.url,
      url: request.url,
      collectionName: response.collectionName ?? undefined,
      content: response.file?.data?.content,
    });
  }
}

export const retrievalService = new RetrievalService();
