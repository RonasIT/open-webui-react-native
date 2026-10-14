import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon } from '../icon';
import { AppPressable, AppPressableProps } from '../pressable';
import { AppText } from '../text';
import { View } from '../view';

export type CheckboxProps = {
  isChecked: boolean;
  label?: string;
  className?: string;
} & Omit<AppPressableProps, 'children'>;

export function Checkbox({ isChecked, label, className, ...pressableProps }: CheckboxProps): ReactElement {
  return (
    <AppPressable className={cn('flex-row items-center gap-12', className)} {...pressableProps}>
      <View
        className={cn(
          'h-24 w-24 items-center justify-center rounded-full',
          isChecked ? 'bg-text-primary' : 'bg-background-secondary border border-text-secondary',
        )}>
        {isChecked && <Icon name='checked' className='color-background-primary h-16 w-16' />}
      </View>
      {label && <AppText className='flex-1 text-md-sm sm:text-md'>{label}</AppText>}
    </AppPressable>
  );
}
