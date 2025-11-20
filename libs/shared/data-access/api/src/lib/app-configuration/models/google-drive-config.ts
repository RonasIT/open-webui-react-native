import { Expose } from 'class-transformer';

export class GoogleDriveConfig {
  @Expose({ name: 'client_id' })
  public clientId: string;

  @Expose({ name: 'api_key' })
  public apiKey: string;

  constructor(partial: Partial<GoogleDriveConfig>) {
    Object.assign(this, partial);
  }
}
