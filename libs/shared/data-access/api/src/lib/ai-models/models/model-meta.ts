import { Expose, Type } from 'class-transformer';
import { AIModelCapabilities } from './model-capabilities';

export class AIModelMeta {
  @Expose()
  public hidden?: boolean;

  @Expose()
  public toolIds?: Array<string>;

  // Feature ids in the server's snake_case form, e.g. `image_generation`, `web_search`.
  @Expose()
  public defaultFeatureIds?: Array<string>;

  @Expose()
  @Type(() => AIModelCapabilities)
  public capabilities?: AIModelCapabilities;
}
