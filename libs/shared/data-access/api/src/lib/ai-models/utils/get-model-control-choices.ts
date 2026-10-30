import { UserSettings } from '../../users/models';
import { ModelControlChoices } from '../models/model-control-choices';

export function getModelControlChoices(settings: UserSettings | undefined, modelId: string): ModelControlChoices {
  return settings?.ui?.params?.modelControls?.[modelId] ?? {};
}
