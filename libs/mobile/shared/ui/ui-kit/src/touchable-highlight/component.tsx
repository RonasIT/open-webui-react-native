import { cssInterop } from 'nativewind';
import { Ref, ReactElement } from 'react';
import {
  TouchableHighlight as RNTouchableHighlight,
  TouchableHighlightProps as RNTouchableHighlightProps,
  View,
} from 'react-native';

const CustomizedTouchableHighlight = cssInterop(RNTouchableHighlight, {
  className: 'style',
  underlayColorClassName: {
    target: false,
    nativeStyleToProp: {
      color: 'underlayColor',
    },
  },
});
export interface TouchableHighlightProps extends RNTouchableHighlightProps {
  ref?: Ref<View>;
  className?: string;
  underlayColorClassName?: string;
}

const TouchableHighlight = (props: TouchableHighlightProps): ReactElement => (
  <CustomizedTouchableHighlight underlayColorClassName='color-background-quaternary' {...props} />
);

TouchableHighlight.displayName = 'TouchableHighlight';

export { TouchableHighlight };
