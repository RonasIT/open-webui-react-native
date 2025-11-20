import { Expose } from 'class-transformer';

export class PermissionsSharing {
  @Expose({ name: 'public_models' })
  public publicModels: boolean;

  @Expose({ name: 'public_knowledge' })
  public publicKnowledge: boolean;

  @Expose({ name: 'public_prompts' })
  public publicPrompts: boolean;

  @Expose({ name: 'public_tools' })
  public publicTools: boolean;

  constructor(partial: Partial<PermissionsSharing>) {
    Object.assign(this, partial);
  }
}
