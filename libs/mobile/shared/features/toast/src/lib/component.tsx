import React, { Fragment, ReactElement } from 'react';
import { AppToast } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

export function ToastProvider({ children }: React.PropsWithChildren): ReactElement {
  return (
    <Fragment>
      {children}
      <AppToast />
    </Fragment>
  );
}
