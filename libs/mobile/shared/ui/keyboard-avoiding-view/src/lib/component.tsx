import { ComponentType } from 'react';
import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export type AppKeyboardAvoidingViewProps = Omit<ScrollViewProps, 'onFocus'> & {
  onFocus?: ((event: any) => void) | null;
  contentContainerStyleKeyboardShown?: StyleProp<ViewStyle>;
  enabled?: boolean;
  bottomOffset?: number;
};

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
