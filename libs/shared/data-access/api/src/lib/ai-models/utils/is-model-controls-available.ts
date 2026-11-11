import { isServerVersionAtLeast } from '../../app-configuration/utils/is-server-version-at-least';
import { isFeaturePermitted } from '../../auth/utils/is-feature-permitted';
import { AIModel } from '../models';

export function isModelControlsAvailable(model?: AIModel): boolean {
  const modelControls = model?.info?.params?.modelControls;
  const controlCount = modelControls ? Object.keys(modelControls).length : 0;

  if (controlCount === 0) {
    return false;
  }

  // NOTE: Open WebUI 0.12.4+ applies model controls for anyone with access to the model; 0.12.0–0.12.3
  // only with `chat.controls` and `chat.params`; remove with 0.12.3 support.
  if (isServerVersionAtLeast('0.12.4')) {
    return true;
  }

  return isFeaturePermitted('chat', 'controls', true) && isFeaturePermitted('chat', 'params', true);
}
