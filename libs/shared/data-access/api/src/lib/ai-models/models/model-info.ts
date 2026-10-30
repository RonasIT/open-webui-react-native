import { Expose, Type } from 'class-transformer';
import { AIModelMeta } from './model-meta';
import { AIModelParams } from './model-params';

export class AIModelInfo {
  @Expose()
  @Type(() => AIModelMeta)
  public meta?: AIModelMeta;

  @Expose()
  @Type(() => AIModelParams)
  public params?: AIModelParams;
}
