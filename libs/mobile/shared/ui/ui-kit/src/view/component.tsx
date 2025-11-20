import { Ref, ReactElement } from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

export interface ViewProps extends RNViewProps {
  ref?: Ref<RNView>;
  className?: string;
}

const View = ({ ref, className, ...props }: ViewProps): ReactElement => (
  <RNView
    ref={ref}
    className={cn(className)}
    {...props} />
);

const AnimatedView = Animated.createAnimatedComponent(View);

View.displayName = 'View';
export { View, AnimatedView };
