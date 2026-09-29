import { Provider } from './enums';

export type SupportedOauthProvider = Provider.GOOGLE | Provider.MICROSOFT | Provider.OIDC;

interface OauthProviderConfig {
  name: string;
  // The server sends a configured display name for this provider (e.g. OIDC OAUTH_PROVIDER_NAME).
  // Others get their lowercase key as the name, so the configured `name` is used instead.
  hasServerName?: boolean;
}

// Providers the app can sign in with, in display order. Adding a provider here is enough
// to show its button whenever the server lists it in `oauth.providers`.
export const oauthProvidersConfig: Record<SupportedOauthProvider, OauthProviderConfig> = {
  [Provider.GOOGLE]: { name: 'Google' },
  [Provider.MICROSOFT]: { name: 'Microsoft' },
  [Provider.OIDC]: { name: 'SSO', hasServerName: true },
};

export const supportedOauthProviders = Object.keys(oauthProvidersConfig) as Array<SupportedOauthProvider>;
