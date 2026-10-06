import { AppEnvName } from '@open-webui-react-native/shared/utils/app-env';
import { FeatureID } from './enums';

export const featureFlagConfig: Record<FeatureID, AppEnvName> = {
  [FeatureID.EXPORT_ARCHIVED_CHAT]: 'development',
  [FeatureID.VOICE_MODE]: 'development',
  [FeatureID.AI_EDIT_MESSAGE]: 'development',
  [FeatureID.AI_REGENERATE_MESSAGE]: 'development',
};
