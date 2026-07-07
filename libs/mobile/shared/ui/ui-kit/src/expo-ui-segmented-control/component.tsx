import SegmentedControl, {
  type NativeSegmentedControlChangeEvent,
  type NativeSegmentedControlIOSChangeEvent,
  type SegmentedControlProps,
} from '@expo/ui/community/segmented-control';
import { ReactElement } from 'react';

export type ExpoUiSegmentedControlProps = SegmentedControlProps;
export type ExpoUiSegmentedControlChangeEvent = NativeSegmentedControlChangeEvent;
export type ExpoUiSegmentedControlIOSChangeEvent = NativeSegmentedControlIOSChangeEvent;

export function ExpoUiSegmentedControl(props: ExpoUiSegmentedControlProps): ReactElement {
  return <SegmentedControl {...props} />;
}

export const ExpoUiSegmentControl = ExpoUiSegmentedControl;
