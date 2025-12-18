import { AppEnvName } from '@open-webui-react-native/shared/utils/app-env';
import { FeatureID } from './enums';

export const featureFlagConfig: Record<FeatureID, AppEnvName> = {
  [FeatureID.ARCHIVE_CHAT]: 'production',
  [FeatureID.API_URL]: 'production',
  [FeatureID.CHAT_FOLDERS]: 'production',
  [FeatureID.EXPORT_ARCHIVED_CHAT]: 'development',
  [FeatureID.KNOWLEDGE]: 'production',
  [FeatureID.EDIT_MESSAGE]: 'production',
  [FeatureID.VOICE_MODE]: 'development',
  [FeatureID.USER_EDIT_MESSAGE]: 'production',
  [FeatureID.AI_EDIT_MESSAGE]: 'development',
  [FeatureID.AI_REGENERATE_MESSAGE]: 'development',
};
