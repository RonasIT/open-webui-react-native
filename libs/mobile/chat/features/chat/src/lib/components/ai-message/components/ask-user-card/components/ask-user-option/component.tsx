import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface AskUserOptionProps {
  label: string;
  onPress: () => void;
  description?: string;
  isSelected?: boolean;
  disabled?: boolean;
}

export function AskUserOption({ label, description, isSelected, disabled, onPress }: AskUserOptionProps): ReactElement {
  return (
    <AppPressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'flex-row items-start gap-8 rounded-xl bg-background-primary px-12 py-10 active:opacity-70',
        isSelected && 'bg-brand-primary-transparent',
      )}>
      <View className='h-20 w-20 shrink-0 items-center justify-center'>
        {isSelected && <Icon name='checkedSmall' className='size-16 color-brand-primary' />}
      </View>
      <View className='min-w-0 flex-1'>
        <AppText className='text-sm-sm sm:text-sm font-medium text-text-primary'>{label}</AppText>
        {!!description && <AppText className='text-xs mt-4 text-text-secondary'>{description}</AppText>}
      </View>
    </AppPressable>
  );
}
