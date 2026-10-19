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

export function removeStaleModelControlChoices({
  model,
  staleControlKeys,
  settings,
}: RemoveStaleModelControlChoicesArgs): void {
  const modelId = model.id;
  const modelControls = model.info?.params?.modelControls ?? {};
  const currentChoices = getModelControlChoices(settings, modelId);
  const cleanedChoices = { ...currentChoices };

  for (const controlKey of staleControlKeys) {
    const controlLabel = modelControls[controlKey]?.label ?? controlKey;
    ToastService.show(i18n.t('SHARED.MODEL_CONTROLS.TEXT_STALE_CHOICE', { control: controlLabel }));
    delete cleanedChoices[controlKey];
  }

  const previousSettings = settings;
  const patchedSettings = buildUserSettingsWithModelControlChoices(previousSettings, modelId, cleanedChoices);

  queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, patchedSettings);

  void usersService.updateUserSettings(patchedSettings).catch(() => {
    queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, previousSettings);
  });
}
