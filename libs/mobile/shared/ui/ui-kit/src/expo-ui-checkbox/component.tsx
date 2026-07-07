import { Checkbox, Host, type CheckboxProps, type UniversalHostProps } from '@expo/ui';
import { ReactElement } from 'react';

export type ExpoUiCheckboxProps = CheckboxProps & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export function ExpoUiCheckbox({ hostProps, ...props }: ExpoUiCheckboxProps): ReactElement {
  return (
    <Host matchContents {...hostProps}>
      <Checkbox {...props} />
    </Host>
  );
}
