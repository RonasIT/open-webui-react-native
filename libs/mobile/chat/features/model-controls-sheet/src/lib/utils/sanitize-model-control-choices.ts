import { AIModel, ModelControlChoices } from '@open-webui-react-native/shared/data-access/api';

export function sanitizeModelControlChoices(model: AIModel, choices: ModelControlChoices): ModelControlChoices {
  const controls = model.info?.params?.modelControls ?? {};
  const sanitized: ModelControlChoices = {};

  for (const [controlKey, optionKey] of Object.entries(choices)) {
    const control = controls[controlKey];

    if (!control?.options[optionKey]) {
      continue;
    }

    if (control.default && optionKey === control.default) {
      continue;
    }

    sanitized[controlKey] = optionKey;
  }

  return sanitized;
}
