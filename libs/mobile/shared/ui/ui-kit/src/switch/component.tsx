import { ReactElement } from 'react';
import { Switch, SwitchProps } from 'react-native';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';

export type AppSwitchProps = Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'>;

export function AppSwitch(props: AppSwitchProps): ReactElement {
  const { isDarkColorScheme } = useColorScheme();

  const inactiveTrackColor = isDarkColorScheme ? colors.backgroundSecondary : colors.backgroundTertiary;

  return (
    <Switch
      trackColor={{ false: inactiveTrackColor, true: colors.brandPrimary }}
      thumbColor={colors.textForeground}
      ios_backgroundColor={inactiveTrackColor}
      {...props}
    />
  );
}
