import { Settings } from '@open-webui-react-native/mobile/settings/features/settings';
import { AppHeader, AppScreen } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useRouter } from 'expo-router';
import { ReactElement } from 'react';

// TODO: Temporary solution, update when design is ready
export default function SettingsScreen(): ReactElement {
  const router = useRouter();
  const translate = useTranslation('APP.SETTINGS_SCREEN');

  return (
    <AppScreen
      header={<AppHeader
        title={translate('TEXT_SETTINGS')}
        onGoBack={router.back}
        titleClassName='max-w-[65%]' />}>
      <Settings />
    </AppScreen>
  );
}
