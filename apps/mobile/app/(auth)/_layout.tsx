import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { Stack } from 'expo-router/stack';
import { ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: navigationConfig.auth.signIn,
};

export default function AuthLayout(): ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*NOTE: Any way back to sign in (button, swipe, Android back) drops the MFA step. */}
      <Stack.Screen name={navigationConfig.auth.signIn} listeners={{ focus: () => mfaState$.set({}) }} />
      {/* Recovery codes are shown once: leave only through the screen buttons. */}
      <Stack.Screen name={navigationConfig.auth.mfa.recoveryCodes} options={{ gestureEnabled: false }} />
    </Stack>
  );
}
