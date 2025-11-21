import { PropsWithChildren, ReactElement } from 'react';
import {
  AppKeyboardAvoidingView,
  AppKeyboardAvoidingViewProps,
} from '@open-webui-react-native/mobile/shared/ui/keyboard-avoiding-view';
import {
  AppSafeAreaView,
  AppSafeAreaViewProps,
  AppScreen,
  AppScreenProps,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface ScreenWrapperProps {
  safeAreaProps?: AppSafeAreaViewProps;
  screenProps?: AppScreenProps;
  isKeyboardAvoiding?: boolean;
  keyBoardAvoidingProps?: AppKeyboardAvoidingViewProps;
  header?: ReactElement;
}

export function ScreenWrapper({
  safeAreaProps,
  children,
  screenProps,
  isKeyboardAvoiding,
  keyBoardAvoidingProps,
}: PropsWithChildren<ScreenWrapperProps>): ReactElement {
  const { header, ...restScreenProps } = screenProps || {};
  const content = isKeyboardAvoiding ? (
    <AppKeyboardAvoidingView {...keyBoardAvoidingProps}>
      <AppScreen {...restScreenProps}>{children}</AppScreen>
    </AppKeyboardAvoidingView>
  ) : (
    <AppScreen {...restScreenProps}>{children}</AppScreen>
  );

  return (
    <AppSafeAreaView
      className='flex-1 bg-background-primary'
      edges={['bottom', 'top']}
      {...safeAreaProps}>
      {header}
      {content}
    </AppSafeAreaView>
  );
}
