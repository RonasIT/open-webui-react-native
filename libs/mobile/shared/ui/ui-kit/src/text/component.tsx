import { ReactElement } from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { getDefaultTextAccessible, NativeText, processTextStyle } from 'react-native-boost/runtime';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

export interface AppTextProps extends Omit<TextProps, 'className'> {
  className?: string;
}

const BoostNativeText = NativeText as typeof RNText;

export const AppText = ({
  children,
  className,
  style,
  numberOfLines,
  ellipsizeMode,
  lineBreakMode,
  adjustsFontSizeToFit,
  allowFontScaling,
  maxFontSizeMultiplier,
  minimumFontScale,
  selectable,
  selectionColor,
  testID,
  accessible,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  onPress,
  onLongPress,
  pointerEvents,
}: AppTextProps): ReactElement => {
  const baseTextClasses = ['font-inter', 'text-md-sm', 'sm:text-md', 'text-text-primary'];
  const isPrimitiveChildren = typeof children === 'string' || typeof children === 'number';
  const shouldUseNativeText = isPrimitiveChildren && !onPress && !onLongPress && selectionColor == null;

  if (shouldUseNativeText) {
    const processedStyleProps = processTextStyle(style);

    return (
      <BoostNativeText
        className={cn(baseTextClasses, className)}
        style={processedStyleProps.style}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode ?? 'tail'}
        lineBreakMode={lineBreakMode}
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        allowFontScaling={allowFontScaling ?? true}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        minimumFontScale={minimumFontScale}
        selectable={processedStyleProps.selectable ?? selectable}
        testID={testID}
        accessible={accessible ?? getDefaultTextAccessible()}
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        accessibilityValue={accessibilityValue}
        pointerEvents={pointerEvents}>
        {children}
      </BoostNativeText>
    );
  }

  return (
    <RNText
      className={cn(baseTextClasses, className)}
      style={style}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      lineBreakMode={lineBreakMode}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      minimumFontScale={minimumFontScale}
      selectable={selectable}
      selectionColor={selectionColor}
      testID={testID}
      accessible={accessible}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      onPress={onPress}
      onLongPress={onLongPress}
      pointerEvents={pointerEvents}>
      {children}
    </RNText>
  );
};
