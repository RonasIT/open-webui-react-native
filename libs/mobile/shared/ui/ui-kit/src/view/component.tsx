import { Ref, ReactElement } from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

export interface ViewProps extends RNViewProps {
  ref?: Ref<RNView>;
  className?: string;
}

const View = ({
  ref,
  children,
  className,
  style,
  testID,
  onLayout,
  id,
  nativeID,
  pointerEvents,
  accessible,
  accessibilityActions,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  collapsable,
  hitSlop,
  importantForAccessibility,
  needsOffscreenAlphaCompositing,
  onAccessibilityAction,
  removeClippedSubviews,
  renderToHardwareTextureAndroid,
  shouldRasterizeIOS,
}: ViewProps): ReactElement => (
  <RNView
    ref={ref}
    className={cn(className)}
    style={style}
    testID={testID}
    onLayout={onLayout}
    nativeID={id ?? nativeID}
    pointerEvents={pointerEvents}
    accessible={accessible}
    accessibilityActions={accessibilityActions}
    accessibilityElementsHidden={accessibilityElementsHidden}
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessibilityState={accessibilityState}
    accessibilityValue={accessibilityValue}
    collapsable={collapsable}
    hitSlop={hitSlop}
    importantForAccessibility={importantForAccessibility}
    needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
    onAccessibilityAction={onAccessibilityAction}
    removeClippedSubviews={removeClippedSubviews}
    renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
    shouldRasterizeIOS={shouldRasterizeIOS}>
    {children}
  </RNView>
);

const AnimatedView = Animated.createAnimatedComponent(View);

View.displayName = 'View';
export { View, AnimatedView };
