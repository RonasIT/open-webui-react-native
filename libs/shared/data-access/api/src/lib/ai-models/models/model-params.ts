import { Expose } from 'class-transformer';
import { ModelControl } from './model-control';

export class AIModelParams {
  @Expose({ name: 'model_controls' })
  public modelControls?: Record<string, ModelControl>;

  constructor(model: Partial<AIModelParams>) {
    Object.assign(this, model);
  }
}
