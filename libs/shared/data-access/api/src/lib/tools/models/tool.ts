import { Expose, Type } from 'class-transformer';
import { ToolMeta } from './tool-meta';

export class Tool {
  @Expose()
  public id: string;

  @Expose()
  public name: string;

  @Expose()
  @Type(() => ToolMeta)
  public meta?: ToolMeta;

  // Sent only for MCP servers behind OAuth. `false` means the user has to sign in through the web
  // interface before the server can be called.
  @Expose()
  public authenticated?: boolean;

  constructor(data: Partial<Tool> = {}) {
    Object.assign(this, data);
  }
}
