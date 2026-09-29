import { IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider } from '@open-webui-react-native/shared/data-access/api';

export type SupportedOauthProvider = Provider.GOOGLE | Provider.MICROSOFT | Provider.OIDC;

interface OauthProviderConfig {
  name: string;
  iconName?: IconName;
  // The server sends a configured display name for this provider (e.g. OIDC OAUTH_PROVIDER_NAME).
  // Others get their lowercase key as the name, so the configured `name` is used instead.
  hasServerName?: boolean;
}

// Providers the app renders a sign-in button for, in display order. Adding a provider here is enough
// to show its button whenever the server lists it in `oauth.providers`.
export const oauthSignInConfig: Record<SupportedOauthProvider, OauthProviderConfig> = {
  [Provider.GOOGLE]: { name: 'Google', iconName: 'googleLogo' },
  [Provider.MICROSOFT]: { name: 'Microsoft', iconName: 'microsoftLogo' },
  [Provider.OIDC]: { name: 'SSO', hasServerName: true },
};

export const supportedOauthProviders = Object.keys(oauthSignInConfig) as Array<SupportedOauthProvider>;
