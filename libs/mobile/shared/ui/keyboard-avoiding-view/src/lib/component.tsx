import { KeyboardAwareScrollView } from '@pietile-native-kit/keyboard-aware-scrollview';
import { ReactElement } from 'react';
import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { commonStyle } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

export type AppKeyboardAvoidingViewProps = ScrollViewProps & {
  contentContainerStyleKeyboardShown?: StyleProp<ViewStyle>;
  enabled?: boolean;
};

// TODO: Research how use nativewind here
export function AppKeyboardAvoidingView({ children, ...restProps }: AppKeyboardAvoidingViewProps): ReactElement {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={commonStyle.fullFlex}
      {...restProps}>
      {children}
    </KeyboardAwareScrollView>
  );
}
