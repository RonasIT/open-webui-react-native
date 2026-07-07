import { Collapsible, Host, RNHostView, type CollapsibleProps, type UniversalHostProps } from '@expo/ui';
import { Fragment, ReactElement } from 'react';

export type ExpoUiCollapsibleProps = CollapsibleProps & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export function ExpoUiCollapsible({ hostProps, children, ...props }: ExpoUiCollapsibleProps): ReactElement {
  return (
    <Host matchContents={{ vertical: true }} {...hostProps}>
      <Collapsible {...props}>
        {children ? <RNHostView matchContents>{<Fragment>{children}</Fragment>}</RNHostView> : undefined}
      </Collapsible>
    </Host>
  );
}
