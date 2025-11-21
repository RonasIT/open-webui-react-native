import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { knowledgeApiConfig } from './config';
import { Knowledge } from './models';

class KnowledgeService extends EntityPromiseService<Knowledge> {
  constructor() {
    super({
      endpoint: knowledgeApiConfig.route,
      entityConstructor: Knowledge,
      apiService: getApiService,
    });
  }

  public async getKnowledge(): Promise<Array<Knowledge>> {
    const response = await getApiService().get<Array<Knowledge>>(`${knowledgeApiConfig.route}/`);

    return response.map((item) => plainToInstance(Knowledge, item));
  }
}

export const knowledgeService = new KnowledgeService();
