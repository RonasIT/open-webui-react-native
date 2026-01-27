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
  const { header, scrollDisabled, ...restScreenProps } = screenProps || {};

  const effectiveScrollDisabled = isKeyboardAvoiding ? true : scrollDisabled;

  const content = isKeyboardAvoiding ? (
    <AppKeyboardAvoidingView {...keyBoardAvoidingProps}>
      <AppScreen scrollDisabled={effectiveScrollDisabled as boolean} {...(restScreenProps as AppScreenProps)}>
        {children}
      </AppScreen>
    </AppKeyboardAvoidingView>
  ) : (
    <AppScreen scrollDisabled={scrollDisabled as boolean} {...(restScreenProps as AppScreenProps)}>
      {children}
    </AppScreen>
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
