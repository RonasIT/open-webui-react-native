import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { toolsApiConfig } from './config';
import { Tool } from './models';

export class ToolsService {
  public async getTools(): Promise<Array<Tool>> {
    // NOTE: `skipToast` because the tools list is background enrichment of the chat input, not
    // something the user asked for. Servers with plugins disabled or a restricted role answer 403
    // or 404 here, and a toast on every chat screen would be pure noise — an empty list simply
    // hides the menu.
    const response = await getApiService().get<Array<object>>(`${toolsApiConfig.route}/`, { skipToast: true });

    return plainToInstance(Tool, response, { excludeExtraneousValues: true });
  }
}

export const toolsService = new ToolsService();
