import { ReactElement } from 'react';
import { colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppSpinner, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface UrlInputLoaderProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function UrlInputLoader({ isLoading, isSuccess, isError }: UrlInputLoaderProps): ReactElement {
  switch (true) {
    case isLoading:
      return <AppSpinner size='small' color={colors.gray500} />;
    case isSuccess:
      return <Icon name='checked' className='color-status-success' />;
    case isError:
      return <Icon name='close' className='color-status-danger' />;
    default:
      return <View />;
  }
}
