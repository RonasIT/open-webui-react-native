import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { audioApiConfig } from './config';
import { TranscriptionAudio } from './models';

export class AudioService {
  public async transcribeAudio(formData: FormData): Promise<TranscriptionAudio> {
    const response = await getApiService().post<TranscriptionAudio>(`${audioApiConfig.route}/transcriptions`, formData);

    return plainToInstance(TranscriptionAudio, response);
  }
}

export const audioService = new AudioService();
