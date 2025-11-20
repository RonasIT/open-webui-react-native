import { colors, useColorScheme } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { AppSpinner } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { navigationConfig } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { useInitRequests } from '@open-web-ui-mobile-client-react-native/shared/features/use-init-requests';
import { useIsRestoring } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: navigationConfig.main.chat.index,
};

export default function MainLayout(): ReactElement {
  const { isLoading } = useInitRequests();
  const isRestoring = useIsRestoring();
  const { isDarkColorScheme } = useColorScheme();

  //NOTE Needs to prefetch all necessary data before showing the main screen
  if (isLoading || isRestoring) {
    return <AppSpinner isFullScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary },
      }}>
      <Stack.Screen name={navigationConfig.main.chat.index} />
      <Stack.Screen name={navigationConfig.main.folder.index} />
    </Stack>
  );
}
