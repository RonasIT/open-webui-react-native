import { ReactElement } from 'react';
import { colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppSpinner, Icon, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface UrlInputLoaderProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retryLabel: string;
  onRetry: () => void;
}

export function UrlInputLoader({
  isLoading,
  isSuccess,
  isError,
  retryLabel,
  onRetry,
}: UrlInputLoaderProps): ReactElement {
  switch (true) {
    case isLoading:
      return <AppSpinner size='small' color={colors.gray500} />;
    case isSuccess:
      return <Icon name='checked' className='color-status-success' />;
    case isError:
      return (
        <IconButton
          iconName='refresh'
          iconProps={{ className: 'color-status-danger' }}
          className='p-0'
          accessibilityRole='button'
          accessibilityLabel={retryLabel}
          onPress={onRetry}
        />
      );
    default:
      return <View />;
  }
}
