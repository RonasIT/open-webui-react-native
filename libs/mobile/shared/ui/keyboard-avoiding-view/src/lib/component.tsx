import { KeyboardAwareScrollView } from '@pietile-native-kit/keyboard-aware-scrollview';
import { ComponentType } from 'react';
import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { commonStyle } from '@open-webui-react-native/mobile/shared/ui/styles';

export type AppKeyboardAvoidingViewProps = Omit<ScrollViewProps, 'onFocus'> & {
  onFocus?: ((event: any) => void) | null;
  contentContainerStyleKeyboardShown?: StyleProp<ViewStyle>;
  enabled?: boolean;
};

// TODO: Research how use nativewind here
export const AppKeyboardAvoidingView: ComponentType<AppKeyboardAvoidingViewProps> = ({ children, ...props }) => {
  const { onFocus, ...restProps } = props;

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={commonStyle.fullFlex}
      onFocus={onFocus ?? undefined}
      {...restProps}>
      {children}
    </KeyboardAwareScrollView>
  );
};
