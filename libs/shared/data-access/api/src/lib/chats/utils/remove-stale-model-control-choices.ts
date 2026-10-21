import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { omit } from 'lodash-es';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AIModel } from '../../ai-models/models';
import { getModelControlChoices } from '../../ai-models/utils/get-model-control-choices';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { usersService } from '../../users/service';
import { setModelControlChoices } from '../../users/utils/set-model-control-choices';

// NOTE: The message is long and lists the controls, so it stays on screen longer than the default.
const staleChoiceToastDuration = 5000;

export interface RemoveStaleModelControlChoicesArgs {
  model: AIModel;
  staleControlKeys: Array<string>;
}

export async function removeStaleModelControlChoices({
  model,
  staleControlKeys,
}: RemoveStaleModelControlChoicesArgs): Promise<void> {
  const modelControls = model.info?.params?.modelControls ?? {};
  const controlNames = staleControlKeys.map((controlKey) =>
    i18n.t('SHARED.MODEL_CONTROLS.TEXT_CONTROL_NAME', { control: modelControls[controlKey].label }),
  );

  // NOTE: One toast for all controls: the toast library keeps only the last one on screen.
  ToastService.show(
    i18n.t('SHARED.MODEL_CONTROLS.TEXT_STALE_CHOICE', {
      count: controlNames.length,
      controls: controlNames.join(i18n.t('SHARED.MODEL_CONTROLS.TEXT_CONTROLS_SEPARATOR')),
    }),
    staleChoiceToastDuration,
  );

  // NOTE: A refetch in flight would put the stale choices back over the cleaned ones.
  await queryClient.cancelQueries({ queryKey: usersApiConfig.getUserSettingsQueryKey });

  queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, (current) =>
    setModelControlChoices(current, model.id, omit(getModelControlChoices(current, model.id), staleControlKeys)),
  );

  try {
    await usersService.updateModelControlChoices(model.id, (choices) => omit(choices, staleControlKeys));
  } catch {
    // NOTE: Not rolled back: a stale choice is useless, and the next load of the settings cleans it again.
  }
}
