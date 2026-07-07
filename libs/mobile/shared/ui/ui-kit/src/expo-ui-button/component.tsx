import { Button, Host, type ButtonProps, type UniversalHostProps } from '@expo/ui';
import { ReactElement } from 'react';

export type ExpoUiButtonProps = ButtonProps & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export function ExpoUiButton({ hostProps, ...props }: ExpoUiButtonProps): ReactElement {
  return (
    <Host matchContents {...hostProps}>
      <Button {...props} />
    </Host>
  );
}
