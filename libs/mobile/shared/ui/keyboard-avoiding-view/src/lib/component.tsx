import { cssInterop } from 'nativewind';
import { ComponentType, ReactElement } from 'react';
import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

export type AppKeyboardAvoidingViewProps = Omit<ScrollViewProps, 'onFocus'> & {
  onFocus?: ((event: any) => void) | null;
  contentContainerStyleKeyboardShown?: StyleProp<ViewStyle>;
  enabled?: boolean;
  bottomOffset?: number;
};

const CustomizedKeyboardAwareScrollView = cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

interface AppKeyboardAwareScrollViewProps extends KeyboardAwareScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

// TODO: Remove other instances of AppKeyboardAwareScrollView
export function AppKeyboardAwareScrollView(props: AppKeyboardAwareScrollViewProps): ReactElement {
  return <CustomizedKeyboardAwareScrollView showsVerticalScrollIndicator={false} {...props} />;
}

// TODO: Research how use nativewind here
export const AppKeyboardAvoidingView: ComponentType<AppKeyboardAvoidingViewProps> = ({ children, ...props }) => {
  const { onFocus, contentContainerStyle, bottomOffset, ...restProps } = props;

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      bottomOffset={bottomOffset}
      onFocus={onFocus ?? undefined}
      {...restProps}>
      {children}
    </KeyboardAwareScrollView>
  );
};
