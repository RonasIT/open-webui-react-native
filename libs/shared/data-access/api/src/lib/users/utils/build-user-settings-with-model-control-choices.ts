import { ModelControlChoices } from '../../ai-models/models/model-control-choices';
import { UserSettings } from '../models';
import { UiParams } from '../models/ui-params';
import { UiSettings } from '../models/ui-settings';

export function buildUserSettingsWithModelControlChoices(
  settings: UserSettings | null | undefined,
  modelId: string,
  choices: ModelControlChoices,
): UserSettings {
  // A user who never saved settings gets `null` from the backend.
  const existingUi = settings?.ui ?? new UiSettings({});
  const existingParams = existingUi.params ?? new UiParams({});
  const modelControls = { ...(existingParams.modelControls ?? {}), [modelId]: choices };

  return new UserSettings({
    ui: new UiSettings({
      ...existingUi,
      params: new UiParams({
        ...existingParams,
        modelControls,
      }),
    }),
  });
}
