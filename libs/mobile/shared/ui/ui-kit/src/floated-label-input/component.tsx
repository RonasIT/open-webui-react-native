import { ReactElement, Ref, useState, useEffect } from 'react';
import { NativeSyntheticEvent, Platform, TextInput, TextInputFocusEventData, TextInputProps } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { IconButton } from '../icon-button';
import { AppText } from '../text';
import { AnimatedView, View } from '../view';

export type FloatedLabelInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  isPassword?: boolean;
  className?: string;
  textClassName?: string;
  accessoryRight?: ReactElement;
  ref?: Ref<TextInput>;
} & TextInputProps;

const baseClasses = {
  containerClasses:
    'flex-row gap-8 px-12 py-6 min-h-[56px] rounded-xl w-full justify-end items-center border border-transparent bg-background-secondary ',
  textClasses: 'text-md-sm sm:text-md text-text-primary self-end p-[0px]',
};

export const FloatedLabelInput = ({
  label,
  value,
  placeholder,
  error,
  helperText,
  disabled,
  isPassword,
  className,
  textClassName,
  accessoryRight,
  ref,
  onFocus,
  onBlur,
  ...inputProps
}: FloatedLabelInputProps): ReactElement => {
  const isIos = Platform.OS === 'ios';

  const labelTop = useSharedValue(16);
  const labelLeft = useSharedValue(0);
  const labelScale = useSharedValue(1);

  const [secured, setSecured] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const isLabelFloated = (isFocused || !!value) && !!label;

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    top: labelTop.value,
    left: labelLeft.value,
    transform: [{ scale: labelScale.value }],
    transformOrigin: 'left',
  }));

  const accessoryRightComponent = isPassword ? (
    <IconButton iconName={secured ? 'eye' : 'eyeClosed'} onPress={() => setSecured(!secured)} />
  ) : (
    accessoryRight
  );

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setIsFocused(false);
    onBlur?.(e);
  };

  useEffect(() => {
    labelTop.value = withTiming(isLabelFloated ? 4 : 16, { duration: 180 });
    labelLeft.value = withTiming(isLabelFloated ? 4 : 0, { duration: 180 });
    labelScale.value = withTiming(isLabelFloated ? 0.8 : 1, { duration: 180 });
  }, [isLabelFloated]);

  return (
    <View className='gap-4'>
      {label && (
        <AnimatedView
          className={cn('absolute z-10 pl-12')}
          style={labelAnimatedStyle}
          pointerEvents='none'>
          <AppText
            pointerEvents='none'
            className={cn('text-md-sm sm:text-md text-text-secondary', isLabelFloated && 'text-text-primary')}>
            {label}
          </AppText>
        </AnimatedView>
      )}
      <View
        className={cn(
          baseClasses.containerClasses,
          isFocused && 'border-brand-primary bg-background-primary',
          error && 'border-status-danger',
          disabled && 'bg-background-tertiary',
          className,
        )}>
        <TextInput
          ref={ref}
          value={value}
          className={cn(
            baseClasses.textClasses,
            'flex-1 font-inter',
            isIos && '!leading-[0]',
            disabled && 'text-text-tertiary',
            textClassName,
          )}
          editable={!disabled}
          secureTextEntry={secured && isPassword}
          placeholder={isLabelFloated ? placeholder : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          hitSlop={{ top: 40 }}
          {...inputProps}
        />
        {accessoryRightComponent}
      </View>
      {(error || helperText) && (
        <AppText className={cn('text-sm-sm sm:text-sm', error ? 'text-status-danger' : 'text-text-secondary')}>
          {error || helperText}
        </AppText>
      )}
    </View>
  );
};
