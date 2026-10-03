import { IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider, SupportedOauthProvider } from '@open-webui-react-native/shared/data-access/api';

interface OauthProviderIcon {
  iconName: IconName;
  iconClassName?: string;
}

export const oauthProviderIcons: Partial<Record<SupportedOauthProvider, OauthProviderIcon>> = {
  [Provider.GOOGLE]: { iconName: 'googleLogo' },
  [Provider.MICROSOFT]: { iconName: 'microsoftLogo' },
  [Provider.GITHUB]: { iconName: 'githubLogo', iconClassName: 'color-background-primary' },
};
