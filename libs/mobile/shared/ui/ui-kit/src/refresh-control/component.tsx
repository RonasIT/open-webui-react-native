import { ReactElement } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

export function AppRefreshControl(props: RefreshControlProps): ReactElement {
  return <RefreshControl {...props} />;
}
