import { ReactNode } from 'react';
import { SvgProps } from 'react-native-svg';
import { withClassNameInterop, cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { Icons } from '../assets';
import { IconName } from './types';

export interface IconProps extends SvgProps {
  name: IconName;
  className?: string;
}

function IconComponent({ name, className, ...props }: IconProps): ReactNode {
  const Component = name in Icons && Icons[name];

  return Component ? <Component {...props} /> : null;
}

withClassNameInterop(IconComponent, ['color', 'opacity']);

function Icon({ className, ...props }: IconProps): ReactNode {
  return <IconComponent className={cn('color-text-primary', className)} {...props} />;
}

export { Icon };
