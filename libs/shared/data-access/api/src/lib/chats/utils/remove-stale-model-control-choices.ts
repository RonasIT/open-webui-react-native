import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AIModel } from '../../ai-models/models';
import { getModelControlChoices } from '../../ai-models/utils/get-model-control-choices';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { usersService } from '../../users/service';
import { buildUserSettingsWithModelControlChoices } from '../../users/utils/build-user-settings-with-model-control-choices';

export interface RemoveStaleModelControlChoicesArgs {
  model: AIModel;
  staleControlKeys: Array<string>;
  settings: UserSettings;
}

export async function removeStaleModelControlChoices({
  model,
  staleControlKeys,
  settings,
}: RemoveStaleModelControlChoicesArgs): Promise<void> {
  const modelControls = model.info?.params?.modelControls ?? {};
  const cleanedChoices = { ...getModelControlChoices(settings, model.id) };

  for (const controlKey of staleControlKeys) {
    ToastService.show(i18n.t('SHARED.MODEL_CONTROLS.TEXT_STALE_CHOICE', { control: modelControls[controlKey].label }));
    delete cleanedChoices[controlKey];
  }

  const patchedSettings = buildUserSettingsWithModelControlChoices(model.id, cleanedChoices);

  queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, patchedSettings);

  try {
    await usersService.updateUserSettings(patchedSettings);
  } catch {
    queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, settings);
  }
}
