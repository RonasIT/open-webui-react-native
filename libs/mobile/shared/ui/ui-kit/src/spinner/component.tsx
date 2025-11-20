import { ReactElement } from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { View } from '../view';

export interface AppSpinnerProps extends ActivityIndicatorProps {
  isFullScreen?: boolean;
}

export function AppSpinner({ isFullScreen = false, size = 'large', ...props }: AppSpinnerProps): ReactElement {
  if (isFullScreen) {
    return (
      <View
        className={cn('absolute inset-0 bg-background-primary flex-1 items-center justify-center z-50 w-full h-full')}>
        <ActivityIndicator size={size} {...props} />
      </View>
    );
  }

  return <ActivityIndicator size={size} {...props} />;
}
