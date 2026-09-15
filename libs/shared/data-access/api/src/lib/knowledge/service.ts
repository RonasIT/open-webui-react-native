import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { knowledgeApiConfig } from './config';
import { Knowledge, KnowledgeFileListResponse, KnowledgeResponse } from './models';

class KnowledgeService extends EntityPromiseService<Knowledge> {
  constructor() {
    super({
      endpoint: knowledgeApiConfig.route,
      entityConstructor: Knowledge,
      apiService: getApiService,
    });
  }

  public async searchKnowledge(page: number, query?: string): Promise<KnowledgeResponse> {
    const response = await getApiService().get<KnowledgeResponse>(`${knowledgeApiConfig.route}/search`, {
      page,
      ...(query ? { query } : {}),
    });

    return plainToInstance(KnowledgeResponse, response, {
      excludeExtraneousValues: true,
    });
  }

  public async getKnowledgeFiles(id: string, page: number, query?: string): Promise<KnowledgeFileListResponse> {
    const response = await getApiService().get<KnowledgeFileListResponse>(`${knowledgeApiConfig.route}/${id}/files`, {
      page,
      ...(query ? { query } : {}),
    });

    return plainToInstance(KnowledgeFileListResponse, response, {
      excludeExtraneousValues: true,
    });
  }
}

export const knowledgeService = new KnowledgeService();
