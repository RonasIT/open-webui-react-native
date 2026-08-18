import { ReactElement } from 'react';
import { AppDivider, AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface SettingsSectionOption {
  label: string;
  value?: string;
  onPress: () => void;
}

interface SettingsSectionProps {
  title: string;
  options: Array<SettingsSectionOption>;
}

export function SettingsSection({ title, options }: SettingsSectionProps): ReactElement {
  return (
    <View className='py-12'>
      <AppText className='text-sm-sm sm:text-sm text-text-secondary py-8'>{title}</AppText>
      {options.map((option) => (
        <View key={option.label}>
          <AppPressable
            onPress={option.onPress}
            className='flex-row items-center justify-between py-14 active:opacity-100 active:bg-background-secondary'>
            <AppText className='text-text-primary'>{option.label}</AppText>
            <View className='flex-row items-center gap-8'>
              {option.value && <AppText className='text-text-secondary'>{option.value}</AppText>}
              <Icon name='chevronRight' className='shrink-0 color-text-secondary' />
            </View>
          </AppPressable>
          <AppDivider className='text-text-tertiary' />
        </View>
      ))}
    </View>
  );
}
