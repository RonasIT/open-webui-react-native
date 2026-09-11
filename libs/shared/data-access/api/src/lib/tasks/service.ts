import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { tasksApiConfig } from './config';
import { StopTaskResponse } from './models';

class TasksService {
  public async stopChatTasks(chatId: string): Promise<StopTaskResponse> {
    const response = await getApiService().post<StopTaskResponse>(
      `${tasksApiConfig.route}/chat/${encodeURIComponent(chatId)}/stop`,
    );

    return plainToInstance(StopTaskResponse, response, { excludeExtraneousValues: true });
  }
}

export const tasksService = new TasksService();
