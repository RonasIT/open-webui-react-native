import { Host, Switch, type SwitchProps, type UniversalHostProps } from '@expo/ui';
import { ReactElement } from 'react';

export type ExpoUiSwitchProps = SwitchProps & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export function ExpoUiSwitch({ hostProps, ...props }: ExpoUiSwitchProps): ReactElement {
  return (
    <Host matchContents {...hostProps}>
      <Switch {...props} />
    </Host>
  );
}
