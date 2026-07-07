import DateTimePicker, {
  type DateTimePickerChangeEvent,
  type DateTimePickerEvent,
  type DateTimePickerProps,
} from '@expo/ui/community/datetime-picker';
import { ReactElement } from 'react';

export type ExpoUiDateTimePickerProps = DateTimePickerProps;
export type ExpoUiDateTimePickerEvent = DateTimePickerEvent;
export type ExpoUiDateTimePickerChangeEvent = DateTimePickerChangeEvent;

export function ExpoUiDateTimePicker(props: ExpoUiDateTimePickerProps): ReactElement {
  return <DateTimePicker {...props} />;
}
