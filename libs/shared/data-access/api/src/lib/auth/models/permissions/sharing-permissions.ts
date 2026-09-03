import { Expose } from 'class-transformer';

export class SharingPermissions {
  // NOTE: `USER_PERMISSIONS_FOLDERS_ALLOW_SHARING` on the backend, off unless an admin turns it on.
  @Expose()
  public folders: boolean;

  @Expose({ name: 'public_models' })
  public publicModels: boolean;

  @Expose({ name: 'public_knowledge' })
  public publicKnowledge: boolean;

  @Expose({ name: 'public_prompts' })
  public publicPrompts: boolean;

  @Expose({ name: 'public_tools' })
  public publicTools: boolean;

  constructor(model: Partial<SharingPermissions>) {
    Object.assign(this, model);
  }
}
