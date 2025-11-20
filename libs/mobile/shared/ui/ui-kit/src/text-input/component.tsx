import { ReactElement, Ref } from 'react';
import { Platform, TextInput, TextInputProps, View } from 'react-native';
import { cn, colors } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

export type AppInputProps = {
  label?: string;
  accessoryLeft?: ReactElement;
  accessoryBottom?: ReactElement;
  accessoryTop?: ReactElement;
  maxHeight?: number;
  className?: string;
  textClassName?: string;
  ref?: Ref<TextInput>;
} & TextInputProps;

const baseClasses = {
  containerClasses: 'w-full bg-background-secondary justify-center p-12 min-h-[44px] rounded-xl',
  textClasses: 'flex-1 text-sm-sm sm:text-sm text-text-primary p-[0px]',
};

export const AppTextInput = ({
  onFocus,
  onBlur,
  label,
  accessoryLeft,
  accessoryBottom,
  accessoryTop,
  maxHeight = 0,
  className,
  textClassName,
  hitSlop,
  ref,
  ...inputProps
}: AppInputProps): ReactElement => {
  const isIos = Platform.OS === 'ios';

  return (
    <View className={cn(baseClasses.containerClasses, className)}>
      {accessoryTop}
      <View className={`flex-row gap-12 items-center max-h-[${maxHeight}]`}>
        {accessoryLeft}
        <TextInput
          ref={ref}
          className={cn(baseClasses.textClasses, isIos && '!leading-[0]', textClassName)}
          placeholderTextColor={colors.textSecondary}
          onFocus={onFocus}
          onBlur={onBlur}
          hitSlop={typeof hitSlop === 'number' ? hitSlop : { top: 12, bottom: 12, ...hitSlop }}
          {...inputProps}
        />
      </View>
      {accessoryBottom}
    </View>
  );
};
