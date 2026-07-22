import { cssInterop } from 'nativewind';
import { PropsWithChildren, ReactElement, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View } from '../view';

const ScrollView = cssInterop(GestureHandlerScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface HorizontalOverflowScrollProps extends PropsWithChildren {
  className?: string;
  contentContainerClassName?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsHorizontalScrollIndicator?: boolean;
}

export function HorizontalOverflowScroll({
  children,
  className,
  contentContainerClassName,
  style,
  contentContainerStyle,
  showsHorizontalScrollIndicator = true,
}: HorizontalOverflowScrollProps): ReactElement {
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const isScrollEnabled = contentWidth > containerWidth && containerWidth > 0;

  const handleContainerLayout = (event: LayoutChangeEvent): void => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleContentLayout = (event: LayoutChangeEvent): void => {
    setContentWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleContainerLayout}
      className={cn('w-full self-stretch overflow-hidden', className)}
      style={style}>
      <ScrollView
        horizontal
        bounces={false}
        nestedScrollEnabled
        directionalLockEnabled
        scrollEnabled={isScrollEnabled}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerClassName={contentContainerClassName}
        contentContainerStyle={contentContainerStyle}>
        <View onLayout={handleContentLayout}>{children}</View>
      </ScrollView>
    </View>
  );
}
