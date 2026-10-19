import { AIModel } from '../models';
import { ModelControlChoices } from '../models/model-control-choices';

export interface SplitStaleModelControlChoicesResult {
  validChoices: ModelControlChoices;
  staleControlKeys: Array<string>;
}

export function splitStaleModelControlChoices(
  model: AIModel | undefined,
  choices: ModelControlChoices,
): SplitStaleModelControlChoicesResult {
  const modelControls = model?.info?.params?.modelControls ?? {};
  const validChoices: ModelControlChoices = {};
  const staleControlKeys: Array<string> = [];

  for (const [controlKey, optionKey] of Object.entries(choices)) {
    const control = modelControls[controlKey];

    if (!control || !control.options[optionKey]) {
      staleControlKeys.push(controlKey);
      continue;
    }

    validChoices[controlKey] = optionKey;
  }

  return { validChoices, staleControlKeys };
}
