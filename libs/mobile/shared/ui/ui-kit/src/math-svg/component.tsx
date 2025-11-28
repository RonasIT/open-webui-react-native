import { ReactNode } from 'react';
import MathJax, { MathJaxProps } from 'react-native-mathjax-svg';
import { withClassNameInterop, cn } from '@open-webui-react-native/mobile/shared/ui/styles';

export interface MathSvgProps extends MathJaxProps {
  className?: string;
  children: string;
}

function MathSvgComponent({ className, children, ...props }: MathSvgProps): ReactNode {
  return (
    <MathJax color='transparent' {...props}>
      {children}
    </MathJax>
  );
}

withClassNameInterop(MathSvgComponent, ['color']);

function MathSvg({ className, ...props }: MathSvgProps): ReactNode {
  return <MathSvgComponent className={cn('color-text-primary', className)} {...props} />;
}

export { MathSvg };
