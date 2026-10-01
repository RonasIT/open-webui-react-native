import { IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider, SupportedOauthProvider } from '@open-webui-react-native/shared/data-access/api';

export const oauthProviderIcons: Partial<Record<SupportedOauthProvider, IconName>> = {
  [Provider.GOOGLE]: 'googleLogo',
  [Provider.MICROSOFT]: 'microsoftLogo',
};
