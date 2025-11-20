import {
  AppSafeAreaView as SafeAreaView,
  AppSafeAreaViewProps as SafeAreaViewProps,
} from '@ronas-it/react-native-common-modules/safe-area-view';
import { remapProps } from 'nativewind';
import { ReactElement } from 'react';

export interface AppSafeAreaViewProps extends SafeAreaViewProps {
  className?: string;
}

export function AppSafeAreaView({ style, ...props }: AppSafeAreaViewProps): ReactElement {
  return <SafeAreaView style={style} {...props} />;
}

remapProps(AppSafeAreaView, {
  className: 'style',
});
