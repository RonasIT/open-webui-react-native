import { ModelControlChoices } from '../../ai-models/models/model-control-choices';
import { UserSettings } from '../models';
import { UiParams } from '../models/ui-params';
import { UiSettings } from '../models/ui-settings';
import { mergeUserSettings } from './merge-user-settings';

export function setModelControlChoices(
  settings: UserSettings | null | undefined,
  modelId: string,
  choices: ModelControlChoices,
): UserSettings {
  const params = settings?.ui?.params;

  return mergeUserSettings(
    settings,
    new UserSettings({
      ui: new UiSettings({
        params: new UiParams({ ...params, modelControls: { ...params?.modelControls, [modelId]: choices } }),
      }),
    }),
  );
}
