import { RaTeXView } from 'ratex-react-native';
import { ReactNode } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { withClassNameInterop, cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View } from '../view';

export interface MathSvgProps {
  className?: string;
  children: string;
  fontSize?: number;
  color?: string;
  displayMode?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
}

function MathSvgComponent({ children, fontSize, color, displayMode = true, onLayout, style }: MathSvgProps): ReactNode {
  return (
    <View onLayout={onLayout}>
      <RaTeXView
        latex={children}
        fontSize={fontSize}
        displayMode={displayMode}
        color={color}
        style={style} />
    </View>
  );
}

withClassNameInterop(MathSvgComponent, ['color']);

function MathSvg({ className, ...props }: MathSvgProps): ReactNode {
  return <MathSvgComponent className={cn('color-text-primary', className)} {...props} />;
}

export { MathSvg };
