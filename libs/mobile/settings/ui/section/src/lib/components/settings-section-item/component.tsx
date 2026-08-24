import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppSwitch, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { SettingsSectionOption } from '../../types';

interface SettingsSectionItemProps {
  option: SettingsSectionOption;
}

export function SettingsSectionItem({ option }: SettingsSectionItemProps): ReactElement {
  const { label, iconName, isDanger } = option;

  const title = (
    <View className='shrink-0 flex-row items-center gap-12'>
      {iconName && <Icon name={iconName} className={cn('shrink-0', isDanger && 'color-status-danger')} />}
      <AppText className={cn('shrink-0', isDanger && 'text-status-danger')}>{label}</AppText>
    </View>
  );

  if (option.type === 'switch') {
    return (
      <View className='flex-row items-center justify-between gap-12 py-10'>
        {title}
        <AppSwitch value={option.isEnabled} onValueChange={option.onValueChange} />
      </View>
    );
  }

  return (
    <AppPressable
      onPress={option.onPress}
      className='flex-row items-center justify-between gap-12 py-14 active:opacity-100 active:bg-background-secondary'>
      {title}
      {option.type !== 'action' && (
        <View className='min-w-0 flex-1 flex-row items-center justify-end gap-8'>
          {!!option.value && (
            <AppText numberOfLines={1} className='shrink text-right text-text-secondary'>
              {option.value}
            </AppText>
          )}
          {option.accessoryRight}
          <Icon name='chevronRight' className='shrink-0 color-text-secondary' />
        </View>
      )}
    </AppPressable>
  );
}
