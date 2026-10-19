import { ModelControlChoices } from '../../ai-models/models/model-control-choices';
import { UserSettings } from '../models';
import { UiParams } from '../models/ui-params';
import { UiSettings } from '../models/ui-settings';

export function buildUserSettingsWithModelControlChoices(
  settings: UserSettings,
  modelId: string,
  choices: ModelControlChoices,
): UserSettings {
  const existingParams = settings.ui.params ?? new UiParams({});
  const modelControls = { ...(existingParams.modelControls ?? {}), [modelId]: choices };

  return new UserSettings({
    ui: new UiSettings({
      ...settings.ui,
      params: new UiParams({
        ...existingParams,
        modelControls,
      }),
    }),
  });
}
