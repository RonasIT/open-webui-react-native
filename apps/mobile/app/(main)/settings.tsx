import { AppHeader, AppScreen, AppText } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useRouter } from 'expo-router';
import { ReactElement } from 'react';

// TODO: Temporary solution, update when design is ready
export default function SettingsScreen(): ReactElement {
  const router = useRouter();

  return (
    <AppScreen
      noOutsideSpacing
      scrollDisabled
      header={<AppHeader
        title='Settings'
        onGoBack={router.back}
        titleClassName='max-w-[65%]' />}>
      <AppText>Settings</AppText>
    </AppScreen>
  );
}
