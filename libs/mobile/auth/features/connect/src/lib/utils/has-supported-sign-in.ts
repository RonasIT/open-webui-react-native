import { Configuration, supportedOauthProviders } from '@open-webui-react-native/shared/data-access/api';

// NOTE: With sign-in turned off the server signs anyone in, so that counts as a supported way in.
export const hasSupportedSignIn = (config: Configuration): boolean =>
  config.features?.auth === false ||
  config.features?.enableLoginForm !== false ||
  supportedOauthProviders.some((provider) => provider in (config.oauth?.providers ?? {}));
