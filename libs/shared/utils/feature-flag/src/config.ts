import { AppEnvName } from '@open-webui-react-native/shared/utils/app-env';
import { FeatureID } from './enums';

export const featureFlagConfig: Record<FeatureID, AppEnvName> = {
  [FeatureID.VOICE_MODE]: 'development',
};
