import { Expose } from 'class-transformer';
import { ModelControlChoices } from '../../ai-models/models/model-control-choices';

export class UiParams {
  @Expose({ name: 'model_controls' })
  public modelControls?: Record<string, ModelControlChoices>;

  constructor(model: Partial<UiParams>) {
    Object.assign(this, model);
  }
}
