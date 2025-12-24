import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { Stack } from 'expo-router/stack';
import { ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: navigationConfig.auth.signIn,
};

export default function AuthLayout(): ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={navigationConfig.auth.signIn} />
    </Stack>
  );
}
