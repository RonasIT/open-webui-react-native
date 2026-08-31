import Constants from 'expo-constants';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';

const amplitudeConfig = Constants.expoConfig?.extra?.amplitude;

export const amplitudeApiKey = appEnv.select({
  development: amplitudeConfig?.apiKeyDev,
  staging: amplitudeConfig?.apiKeyDev,
  production: amplitudeConfig?.apiKeyProd,
});
