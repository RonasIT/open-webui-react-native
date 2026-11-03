import { AIModel } from '../../ai-models/models/model';
import { Configuration } from '../../app-configuration/models/configuration';
import { isFeaturePermitted } from '../../auth/utils/is-feature-permitted';
import { ChatGenerationOption } from '../enums';

export type ToggleableGenerationOption = ChatGenerationOption.IMAGE_GENERATION | ChatGenerationOption.WEB_SEARCH;

const isEnabledOnServer: Record<ToggleableGenerationOption, (configuration?: Configuration) => boolean> = {
  [ChatGenerationOption.IMAGE_GENERATION]: (configuration) => Boolean(configuration?.features.enableImageGeneration),
  [ChatGenerationOption.WEB_SEARCH]: (configuration) => Boolean(configuration?.features.enableWebSearch),
};

// Generation options the chat input offers a toggle for, mirroring the web interface: the server has
// the feature on, the user may use it (admins always may), and the model does not opt out of it — a
// capability the admin never set counts as supported.
// TODO: Code interpreter is not offered yet; it gets its own toggle and default in a separate task.
export function getAvailableGenerationOptions(
  model?: AIModel,
  configuration?: Configuration,
): Array<ToggleableGenerationOption> {
  const capabilities = model?.info?.meta?.capabilities;
  const options: Array<ToggleableGenerationOption> = [
    ChatGenerationOption.IMAGE_GENERATION,
    ChatGenerationOption.WEB_SEARCH,
  ];

  return options.filter(
    (option) =>
      isEnabledOnServer[option](configuration) &&
      isFeaturePermitted('features', option, true) &&
      (capabilities?.[option] ?? true),
  );
}
