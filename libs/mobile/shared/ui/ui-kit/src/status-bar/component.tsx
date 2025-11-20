import { ReactElement } from 'react';
import { StatusBar as RNStatusBar, StatusBarProps as RNStatusBarProps } from 'react-native';
import { withClassNameInterop } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

withClassNameInterop(RNStatusBar, ['backgroundColor']);

export interface StatusBarProps extends RNStatusBarProps {
  className?: string;
}

const StatusBar = (props: StatusBarProps): ReactElement => <RNStatusBar {...props} />;

StatusBar.displayName = 'StatusBar';
export { StatusBar };
