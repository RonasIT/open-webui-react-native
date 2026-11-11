import { AIModel } from '../../ai-models/models/model';
import { isServerVersionAtLeast } from '../../app-configuration/utils/is-server-version-at-least';
import { ChatGenerationOption } from '../enums';
import { ToggleableGenerationOption } from './get-available-generation-options';

const featureIds: Record<ToggleableGenerationOption, string> = {
  [ChatGenerationOption.IMAGE_GENERATION]: 'image_generation',
  [ChatGenerationOption.WEB_SEARCH]: 'web_search',
};

export interface ResolveDefaultGenerationOptionsArgs {
  model?: AIModel;
  availableOptions: Array<ToggleableGenerationOption>;
}

// Generation options a chat starts with when the user has not toggled any, mirroring the web
// interface: an option is on when the model lists it among its default features and supports it.
export function resolveDefaultGenerationOptions({
  model,
  availableOptions,
}: ResolveDefaultGenerationOptionsArgs): Array<ChatGenerationOption> {
  const meta = model?.info?.meta;
  // NOTE: Open WebUI 0.10.0–0.12.4 needs the capability set explicitly, 0.12.5+ counts an unset one
  // as supported; remove with 0.12.4 support.
  const isUnsetCapabilitySupported = isServerVersionAtLeast('0.12.5');

  return availableOptions.filter(
    (option) =>
      (meta?.capabilities?.[option] ?? isUnsetCapabilitySupported) &&
      Boolean(meta?.defaultFeatureIds?.includes(featureIds[option])),
  );
}
