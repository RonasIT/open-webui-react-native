import {
  LinearGradient as ExpoLinearGradient,
  LinearGradientProps as ExpoLinearGradientProps,
} from 'expo-linear-gradient';
import { Ref, ReactElement } from 'react';
import { cn, withClassNameInterop } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

export interface LinearGradientProps extends Omit<ExpoLinearGradientProps, 'style'> {
  ref?: Ref<ExpoLinearGradient>;
  className?: string;
}

const LinearGradient = ({ ref, className, ...props }: LinearGradientProps): ReactElement => (
  <ExpoLinearGradient
    ref={ref}
    className={cn(className)}
    {...props} />
);

withClassNameInterop(LinearGradient);

LinearGradient.displayName = 'LinearGradient';
export { LinearGradient };
