import { Provider } from './enums';
import { SupportedOauthProvider } from './types';

interface OauthProviderConfig {
  name: string;
  hasServerName?: boolean;
}

export const oauthProvidersConfig: Record<SupportedOauthProvider, OauthProviderConfig> = {
  [Provider.GOOGLE]: { name: 'Google' },
  [Provider.MICROSOFT]: { name: 'Microsoft' },
  [Provider.OIDC]: { name: 'SSO', hasServerName: true },
};

export const supportedOauthProviders = Object.keys(oauthProvidersConfig) as Array<SupportedOauthProvider>;
