import { Expose } from 'class-transformer';

export class AIModelMeta {
  @Expose()
  public hidden?: boolean;

  @Expose()
  public toolIds?: Array<string>;
}
