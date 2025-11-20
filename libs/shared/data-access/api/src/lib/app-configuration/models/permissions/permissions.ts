import { Expose, Type } from 'class-transformer';
import { PermissionsChat } from './permission-chat';
import { PermissionsFeatures } from './permission-features';
import { PermissionsSharing } from './permission-sharing';
import { PermissionsWorkspace } from './permission-workspace';

export class Permissions {
  @Expose()
  @Type(() => PermissionsWorkspace)
  public workspace: PermissionsWorkspace;

  @Expose()
  @Type(() => PermissionsSharing)
  public sharing: PermissionsSharing;

  @Expose()
  @Type(() => PermissionsChat)
  public chat: PermissionsChat;

  @Expose()
  @Type(() => PermissionsFeatures)
  public features: PermissionsFeatures;

  constructor(partial: Partial<Permissions>) {
    Object.assign(this, partial);
  }
}
