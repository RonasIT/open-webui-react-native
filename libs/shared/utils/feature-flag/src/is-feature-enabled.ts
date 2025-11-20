import { appEnv, appEnvStage } from '@open-web-ui-mobile-client-react-native/shared/utils/app-env';
import { featureFlagConfig } from './config';
import { FeatureID } from './enums';

export function isFeatureEnabled(featureID: FeatureID): boolean {
  const featureEnv = featureFlagConfig[featureID];
  const currentEnv = appEnv.current;

  return appEnvStage[currentEnv] <= appEnvStage[featureEnv];
}
