import { Expose } from 'class-transformer';

export class PermissionsWorkspace {
  @Expose()
  public models: boolean;

  @Expose()
  public knowledge: boolean;

  @Expose()
  public prompts: boolean;

  @Expose()
  public tools: boolean;

  constructor(partial: Partial<PermissionsWorkspace>) {
    Object.assign(this, partial);
  }
}
