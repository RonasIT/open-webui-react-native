import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { tasksApiConfig } from './config';
import { ChatTasksResponse, StopTaskResponse } from './models';

class TasksService {
  public async getChatTasks(chatId: string): Promise<ChatTasksResponse> {
    const response = await getApiService().get<ChatTasksResponse>(`${tasksApiConfig.route}/chat/${chatId}`);

    return plainToInstance(ChatTasksResponse, response, { excludeExtraneousValues: true });
  }

  public async stopTask(taskId: string): Promise<StopTaskResponse> {
    return await getApiService().post<StopTaskResponse>(`${tasksApiConfig.route}/stop/${taskId}`);
  }
}

export const tasksService = new TasksService();
