import { Expose } from 'class-transformer';
import { ModelControlDisplay } from '../enums';
import { ModelControlOption } from './model-control-option';

export class ModelControl {
  @Expose()
  public label: string;

  @Expose()
  public description?: string;

  @Expose()
  public default?: string;

  @Expose()
  public display?: ModelControlDisplay;

  @Expose()
  public options: Record<string, ModelControlOption>;

  constructor(model: Partial<ModelControl>) {
    Object.assign(this, model);
  }
}
