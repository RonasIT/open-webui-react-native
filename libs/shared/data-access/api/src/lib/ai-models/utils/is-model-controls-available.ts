import { isFeaturePermitted } from '../../auth/utils/is-feature-permitted';
import { AIModel } from '../models';

export function isModelControlsAvailable(model?: AIModel): boolean {
  const modelControls = model?.info?.params?.modelControls;
  const controlCount = modelControls ? Object.keys(modelControls).length : 0;

  if (controlCount === 0) {
    return false;
  }

  return isFeaturePermitted('chat', 'controls', true) && isFeaturePermitted('chat', 'params', true);
}
