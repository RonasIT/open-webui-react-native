import { cssInterop } from 'nativewind';
import { ReactElement } from 'react';
import { Platform } from 'react-native';
import { KeyboardAvoidingView, KeyboardAvoidingViewProps } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

const CustomizedKeyboardAvoidingView = cssInterop(KeyboardAvoidingView, {
  className: 'style',
});
type AppKeyboardControllerViewProps = Omit<KeyboardAvoidingViewProps, 'contentContainerStyle'> & {
  className?: string;
  contentContainerClassName?: string;
  isInBottomSheet?: boolean;
};

export function AppKeyboardControllerView({
  className,
  keyboardVerticalOffset,
  isInBottomSheet,
  ...restProps
}: AppKeyboardControllerViewProps): ReactElement {
  const { top } = useSafeAreaInsets();
  const verticalOffset = Platform.select({
    ios: isInBottomSheet ? top : top + 8,
    android: isInBottomSheet ? 85 : 16,
  });

  return (
    <CustomizedKeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset ?? verticalOffset}
      behavior='padding'
      className={cn('flex-1', className)}
      {...restProps}
    />
  );
}
