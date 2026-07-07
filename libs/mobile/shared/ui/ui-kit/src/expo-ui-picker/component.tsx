import {
  Host,
  Picker,
  type PickerItemProps,
  type PickerItemValue,
  type PickerProps,
  type UniversalHostProps,
} from '@expo/ui';
import { ReactElement } from 'react';

export type ExpoUiPickerProps<TValue extends PickerItemValue = PickerItemValue> = PickerProps<TValue> & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export type ExpoUiPickerItemProps<TValue extends PickerItemValue = PickerItemValue> = PickerItemProps<TValue>;

function ExpoUiPickerComponent<TValue extends PickerItemValue = PickerItemValue>({
  hostProps,
  ...props
}: ExpoUiPickerProps<TValue>): ReactElement {
  return (
    <Host matchContents {...hostProps}>
      <Picker<TValue> {...props} />
    </Host>
  );
}

export const ExpoUiPicker = Object.assign(ExpoUiPickerComponent, {
  Item: Picker.Item,
});
