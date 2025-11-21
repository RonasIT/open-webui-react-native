import React, { Fragment, ReactElement } from 'react';
import { AppToast } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export function ToastProvider({ children }: React.PropsWithChildren): ReactElement {
  return (
    <Fragment>
      {children}
      <AppToast />
    </Fragment>
  );
}
