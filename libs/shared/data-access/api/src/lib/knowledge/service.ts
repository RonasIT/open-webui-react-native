import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { knowledgeApiConfig } from './config';
import { Knowledge, KnowledgeResponse } from './models';

class KnowledgeService extends EntityPromiseService<Knowledge> {
  constructor() {
    super({
      endpoint: knowledgeApiConfig.route,
      entityConstructor: Knowledge,
      apiService: getApiService,
    });
  }

  public async getKnowledge(): Promise<Array<Knowledge>> {
    const response = await getApiService().get<KnowledgeResponse>(`${knowledgeApiConfig.route}/`);

    const transformed = plainToInstance(KnowledgeResponse, response, {
      excludeExtraneousValues: true,
    });

    return transformed.items.map((item) =>
      plainToInstance(Knowledge, item, {
        excludeExtraneousValues: true,
      }),
    );
  }
}

export const knowledgeService = new KnowledgeService();
