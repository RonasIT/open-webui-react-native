import { AIModel } from '../../ai-models/models/model';
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
// interface: an option is on when the model lists it among its default features and does not turn
// the matching capability off. An unset capability counts as supported, as in the web.
export function resolveDefaultGenerationOptions({
  model,
  availableOptions,
}: ResolveDefaultGenerationOptionsArgs): Array<ChatGenerationOption> {
  const meta = model?.info?.meta;

  return availableOptions.filter(
    (option) =>
      (meta?.capabilities?.[option] ?? true) && Boolean(meta?.defaultFeatureIds?.includes(featureIds[option])),
  );
}
