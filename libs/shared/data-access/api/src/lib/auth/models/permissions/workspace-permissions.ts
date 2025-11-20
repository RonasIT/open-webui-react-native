import { Expose } from 'class-transformer';

export class WorkspacePermissions {
  @Expose()
  public models: boolean;

  @Expose()
  public knowledge: boolean;

  @Expose()
  public prompts: boolean;

  @Expose()
  public tools: boolean;

  constructor(model: Partial<WorkspacePermissions>) {
    Object.assign(this, model);
  }
}
