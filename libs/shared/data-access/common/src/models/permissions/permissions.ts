import { Expose, Type } from 'class-transformer';
import { ChatPermissions } from './chat-permissions';
import { FeaturesPermissions } from './features-permissions';
import { SharingPermissions } from './sharing-permissions';
import { WorkspacePermissions } from './workspace-permissions';

export class Permissions {
  @Expose()
  @Type(() => WorkspacePermissions)
  public workspace: WorkspacePermissions;

  @Expose()
  @Type(() => SharingPermissions)
  public sharing: SharingPermissions;

  @Expose()
  @Type(() => ChatPermissions)
  public chat: ChatPermissions;

  @Expose()
  @Type(() => FeaturesPermissions)
  public features: FeaturesPermissions;

  constructor(model: Partial<Permissions>) {
    Object.assign(this, model);
  }
}
