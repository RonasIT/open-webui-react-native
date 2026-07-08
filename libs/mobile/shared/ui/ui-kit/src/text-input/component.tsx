import {
  Host,
  TextInput as ExpoTextInput,
  type TextInputProps as ExpoTextInputProps,
  type TextInputRef as ExpoTextInputRef,
  useNativeState,
} from '@expo/ui';
import { BottomSheetTextInput as BottomSheetTextInputComponent } from '@expo/ui/community/bottom-sheet';
import { cssInterop } from 'nativewind';
import { ComponentRef, ReactElement, Ref, useEffect } from 'react';
import { Platform, StyleSheet as RNStyleSheet, TextInputProps, View } from 'react-native';
import { cn, colors } from '@open-webui-react-native/mobile/shared/ui/styles';

const CustomizedExpoTextInput = cssInterop(ExpoTextInput, {
  className: 'textStyle',
}) as (props: ExpoTextInputProps & { className?: string }) => ReactElement;

export type AppInputProps = {
  label?: string;
  accessoryLeft?: ReactElement;
  accessoryBottom?: ReactElement;
  accessoryTop?: ReactElement;
  maxHeight?: number;
  className?: string;
  textClassName?: string;
  ref?: Ref<ExpoTextInputRef>;
} & TextInputProps;

const baseClasses = {
  containerClasses: 'w-full bg-background-secondary justify-center p-12 min-h-[44px] rounded-xl',
  textClasses: 'flex-1 text-sm-sm sm:text-sm text-text-primary p-[0px]',
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
    fontSize: 11.375,
    lineHeight: 17.0625,
  },
});

export const AppTextInput = ({
  value,
  defaultValue,
  style,
  cursorColor,
  pointerEvents,
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
  const inputValue = useNativeState(value ?? defaultValue ?? '');
  const inputStyle = RNStyleSheet.flatten(style);

  useEffect(() => {
    if (value !== undefined && inputValue.value !== value) {
      inputValue.value = value;
    }
  }, [value, inputValue]);

  return (
    <View className={cn(baseClasses.containerClasses, className)}>
      {accessoryTop}
      <View className={`flex-row gap-12 items-center max-h-[${maxHeight}]`}>
        {accessoryLeft}
        <Host
          matchContents={{ vertical: true }}
          style={styles.expoInputHost}
          hitSlop={typeof hitSlop === 'number' ? hitSlop : { top: 12, bottom: 12, ...hitSlop }}
          pointerEvents={pointerEvents}>
          <CustomizedExpoTextInput
            {...(inputProps as ExpoTextInputProps)}
            ref={ref}
            value={inputValue}
            className={cn(baseClasses.textClasses, textClassName)}
            placeholderTextColor={colors.textSecondary}
            cursorColor={cursorColor ?? undefined}
            style={{ ...styles.expoInput, ...inputStyle } as ExpoTextInputProps['style']}
            textStyle={styles.expoInputText as ExpoTextInputProps['textStyle']}
          />
        </Host>
      </View>
      {accessoryBottom}
    </View>
  );
};

export type BottomSheetTextInputRef = ComponentRef<typeof BottomSheetTextInputComponent>;

export type BottomSheetTextInputProps = Omit<AppInputProps, 'ref'> & {
  ref?: Ref<BottomSheetTextInputRef>;
};

export const BottomSheetTextInput = ({
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
}: BottomSheetTextInputProps): ReactElement => {
  const isIos = Platform.OS === 'ios';

  return (
    <View className={cn(baseClasses.containerClasses, className)}>
      {accessoryTop}
      <View className={`flex-row gap-12 items-center max-h-[${maxHeight}]`}>
        {accessoryLeft}
        <BottomSheetTextInputComponent
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
