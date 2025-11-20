import { Expose } from 'class-transformer';

export class OneDriveConfig {
  @Expose({ name: 'client_id' })
  public clientId: string;

  @Expose({ name: 'sharepoint_url' })
  public sharepointUrl: string;

  @Expose({ name: 'sharepoint_tenant_id' })
  public sharepointTenantId: string;

  constructor(partial: Partial<OneDriveConfig>) {
    Object.assign(this, partial);
  }
}
