import { Expose } from 'class-transformer';

export class ToolMeta {
  @Expose()
  public description?: string;
}
