import {
  Host,
  TextInput as ExpoTextInput,
  type TextInputProps as ExpoTextInputProps,
  type TextInputRef as ExpoTextInputRef,
  useNativeState,
} from '@expo/ui';
import { cssInterop } from 'nativewind';
import { ReactElement, Ref, useState, useEffect } from 'react';
import { StyleSheet as RNStyleSheet, TextInputProps } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { cn, colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import { IconButton } from '../icon-button';
import { AppText } from '../text';
import { AnimatedView, View } from '../view';

const CustomizedExpoTextInput = cssInterop(ExpoTextInput, {
  className: 'textStyle',
}) as (props: ExpoTextInputProps & { className?: string }) => ReactElement;

export type FloatedLabelInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  isPassword?: boolean;
  className?: string;
  textClassName?: string;
  accessoryRight?: ReactElement;
  ref?: Ref<ExpoTextInputRef>;
} & TextInputProps;

const baseClasses = {
  containerClasses:
    'flex-row gap-8 px-12 py-6 min-h-[56px] rounded-xl w-full justify-end items-center border border-transparent bg-background-secondary ',
  textClasses: 'text-md-sm sm:text-md text-text-primary self-end p-[0px]',
};

const styles = RNStyleSheet.create({
  expoInputHost: {
    flex: 1,
  },
  expoInput: {
    flex: 1,
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  expoInputText: {
    color: colors.textPrimary,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 21,
  },
});

export const FloatedLabelInput = ({
  label,
  value,
  defaultValue,
  style,
  cursorColor,
  pointerEvents,
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
  const inputValue = useNativeState(value ?? defaultValue ?? '');
  const inputStyle = RNStyleSheet.flatten(style);

  const labelTop = useSharedValue(16);
  const labelLeft = useSharedValue(0);
  const labelScale = useSharedValue(1);

  const [secured, setSecured] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const isLabelFloated = (isFocused || !!value) && !!label;

  useEffect(() => {
    if (value !== undefined && inputValue.value !== value) {
      inputValue.value = value;
    }
  }, [value, inputValue]);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    top: labelTop.value,
    left: labelLeft.value,
    transform: [{ scale: labelScale.value }],
  }));

  const accessoryRightComponent = isPassword ? (
    <IconButton iconName={secured ? 'eye' : 'eyeClosed'} onPress={() => setSecured(!secured)} />
  ) : (
    accessoryRight
  );

  const handleFocus: ExpoTextInputProps['onFocus'] = (): void => {
    setIsFocused(true);
    (onFocus as ExpoTextInputProps['onFocus'])?.();
  };

  const handleBlur: ExpoTextInputProps['onBlur'] = (): void => {
    setIsFocused(false);
    (onBlur as ExpoTextInputProps['onBlur'])?.();
  };

  useEffect(() => {
    labelTop.value = withTiming(isLabelFloated ? 4 : 16, { duration: 180 });
    labelLeft.value = withTiming(isLabelFloated ? 4 : 0, { duration: 180 });
    labelScale.value = withTiming(isLabelFloated ? 0.8 : 1, { duration: 180 });
  }, [isLabelFloated, labelLeft, labelScale, labelTop]);

  return (
    <View className='gap-4'>
      {label && (
        <AnimatedView
          className={cn('absolute z-10 pl-12')}
          style={[labelAnimatedStyle, { transformOrigin: 'left' }]}
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
        <Host
          matchContents={{ vertical: true }}
          style={styles.expoInputHost}
          hitSlop={{ top: 40 }}
          pointerEvents={pointerEvents}>
          <CustomizedExpoTextInput
            {...(inputProps as ExpoTextInputProps)}
            ref={ref}
            value={inputValue}
            className={cn(
              baseClasses.textClasses,
              'flex-1 font-inter',
              disabled && 'text-text-tertiary',
              textClassName,
            )}
            editable={!disabled}
            secureTextEntry={secured && isPassword}
            placeholder={isLabelFloated ? placeholder : undefined}
            placeholderTextColor={colors.textSecondary}
            cursorColor={cursorColor ?? undefined}
            style={{ ...styles.expoInput, ...inputStyle } as ExpoTextInputProps['style']}
            textStyle={styles.expoInputText as ExpoTextInputProps['textStyle']}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Host>
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
