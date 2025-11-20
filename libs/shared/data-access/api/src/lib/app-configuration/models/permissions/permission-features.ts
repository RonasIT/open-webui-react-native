import { Expose } from 'class-transformer';

export class PermissionsFeatures {
  @Expose({ name: 'direct_tool_servers' })
  public directToolServers: boolean;

  @Expose({ name: 'web_search' })
  public webSearch: boolean;

  @Expose({ name: 'image_generation' })
  public imageGeneration: boolean;

  @Expose({ name: 'code_interpreter' })
  public codeInterpreter: boolean;

  @Expose()
  public notes: boolean;

  constructor(partial: Partial<PermissionsFeatures>) {
    Object.assign(this, partial);
  }
}
