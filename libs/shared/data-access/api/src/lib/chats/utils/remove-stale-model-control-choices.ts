import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { omit } from 'lodash-es';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AIModel } from '../../ai-models/models';
import { getModelControlChoices } from '../../ai-models/utils/get-model-control-choices';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { usersService } from '../../users/service';
import { restoreUserSettingsQueryData } from '../../users/utils/restore-user-settings-query-data';
import { setModelControlChoices } from '../../users/utils/set-model-control-choices';

export interface RemoveStaleModelControlChoicesArgs {
  model: AIModel;
  staleControlKeys: Array<string>;
}

export async function removeStaleModelControlChoices({
  model,
  staleControlKeys,
}: RemoveStaleModelControlChoicesArgs): Promise<void> {
  const modelControls = model.info?.params?.modelControls ?? {};

  for (const controlKey of staleControlKeys) {
    ToastService.show(i18n.t('SHARED.MODEL_CONTROLS.TEXT_STALE_CHOICE', { control: modelControls[controlKey].label }));
  }

  const previousSettings = queryClient.getQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey);
  const cleanedChoices = omit(getModelControlChoices(previousSettings ?? undefined, model.id), staleControlKeys);

  queryClient.setQueryData<UserSettings>(
    usersApiConfig.getUserSettingsQueryKey,
    setModelControlChoices(previousSettings, model.id, cleanedChoices),
  );

  try {
    await usersService.updateModelControlChoices(model.id, (choices) => omit(choices, staleControlKeys));
  } catch {
    restoreUserSettingsQueryData(previousSettings);
  }
}
