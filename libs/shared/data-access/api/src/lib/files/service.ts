import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { FileData, FileDataContent } from '@open-webui-react-native/shared/data-access/common';
import { filesApiConfig } from './config';

class FilesService {
  public async uploadFile(formData: FormData): Promise<FileData> {
    const response = await getApiService().post<FileData>(filesApiConfig.route, formData);

    return plainToInstance(FileData, response);
  }

  public async getFileContent(id: string): Promise<FileDataContent> {
    return getApiService().get<FileDataContent>(`${filesApiConfig.route}${id}/data/content`);
  }
}

export const filesService = new FilesService();
