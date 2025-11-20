import { Stack } from 'expo-router/stack';
import { ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: '[id]',
};

export default function FolderLayout(): ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='[id]' />
    </Stack>
  );
}
