import { Expose } from 'class-transformer';

export class ModelControlOption {
  @Expose()
  public label: string;

  constructor(model: Partial<ModelControlOption>) {
    Object.assign(this, model);
  }
}
