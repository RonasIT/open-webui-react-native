import { ModelControlChoices } from '../../ai-models/models/model-control-choices';
import { UserSettings } from '../models';
import { UiParams } from '../models/ui-params';
import { buildUserSettings } from './build-user-settings';

// NOTE: The backend replaces `ui.params` whole, so the other params are carried over.
export function buildUserSettingsWithModelControlChoices(modelId: string, choices: ModelControlChoices): UserSettings {
  return buildUserSettings((current) => {
    const params = current?.ui?.params;

    return {
      ui: { params: new UiParams({ ...params, modelControls: { ...params?.modelControls, [modelId]: choices } }) },
    };
  });
}
