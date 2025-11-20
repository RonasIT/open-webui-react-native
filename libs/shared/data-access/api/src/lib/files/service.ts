import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { FileData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { filesApiConfig } from './config';

class FilesService {
  public async uploadFile(formData: FormData): Promise<FileData> {
    const response = await getApiService().post<FileData>(filesApiConfig.route, formData);

    return plainToInstance(FileData, response);
  }
}

export const filesService = new FilesService();
