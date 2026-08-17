import { Expose, Type } from 'class-transformer';
import { AIModelMeta } from './model-meta';

export class AIModelInfo {
  @Expose()
  @Type(() => AIModelMeta)
  public meta?: AIModelMeta;
}
