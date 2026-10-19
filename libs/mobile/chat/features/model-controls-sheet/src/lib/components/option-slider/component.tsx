import { ReactElement, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ModelControlOption } from '@open-webui-react-native/shared/data-access/api';

const THUMB_SIZE = 24;

export interface OptionSliderProps {
  optionKeys: Array<string>;
  options: Record<string, ModelControlOption>;
  selectedOptionKey?: string;
  defaultOptionKey?: string;
  onOptionChange: (optionKey: string) => void;
}

export function OptionSlider({
  optionKeys,
  options,
  selectedOptionKey,
  defaultOptionKey,
  onOptionChange,
}: OptionSliderProps): ReactElement {
  const stepCount = optionKeys.length;
  const resolvedOptionKey = selectedOptionKey ?? defaultOptionKey ?? optionKeys[0];
  const resolvedIndex = Math.max(0, optionKeys.indexOf(resolvedOptionKey));

  const [trackWidth, setTrackWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(resolvedIndex);
  const [isDragging, setIsDragging] = useState(false);
  const thumbOffset = useSharedValue(0);
  const dragStartOffset = useSharedValue(0);

  const stepWidth = stepCount > 1 ? (trackWidth - THUMB_SIZE) / (stepCount - 1) : 0;

  const indexToOffset = (index: number): number => index * stepWidth;

  useEffect(() => {
    const nextIndex = Math.max(0, optionKeys.indexOf(resolvedOptionKey));
    setActiveIndex(nextIndex);

    if (trackWidth > 0) {
      thumbOffset.value = indexToOffset(nextIndex);
    }
  }, [resolvedOptionKey, optionKeys, trackWidth, stepWidth]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const width = event.nativeEvent.layout.width;
    setTrackWidth(width);

    const offset = stepCount > 1 ? indexToOffset(resolvedIndex) : 0;
    thumbOffset.value = offset;
  };

  const snapToIndex = (index: number): void => {
    const clampedIndex = Math.min(Math.max(index, 0), stepCount - 1);
    setActiveIndex(clampedIndex);
    thumbOffset.value = indexToOffset(clampedIndex);
    onOptionChange(optionKeys[clampedIndex]);
    setIsDragging(false);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsDragging)(true);
      dragStartOffset.value = thumbOffset.value;
    })
    .onUpdate((event) => {
      if (stepCount <= 1) {
        return;
      }

      const maxOffset = trackWidth - THUMB_SIZE;
      const nextOffset = Math.min(Math.max(dragStartOffset.value + event.translationX, 0), maxOffset);
      thumbOffset.value = nextOffset;
      const index = Math.round(nextOffset / stepWidth);
      runOnJS(setActiveIndex)(index);
    })
    .onEnd(() => {
      if (stepCount <= 1) {
        runOnJS(setIsDragging)(false);

        return;
      }

      const index = Math.round(thumbOffset.value / stepWidth);
      runOnJS(snapToIndex)(index);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbOffset.value }],
  }));

  const tooltipLabel = options[optionKeys[activeIndex]]?.label ?? '';

  return (
    <View className='gap-12'>
      {isDragging && tooltipLabel && (
        <View className='self-center bg-background-secondary px-12 py-8 rounded-lg'>
          <AppText className='text-sm-sm sm:text-sm'>{tooltipLabel}</AppText>
        </View>
      )}
      <GestureDetector gesture={panGesture}>
        <View className='h-32 justify-center' onLayout={handleTrackLayout}>
          <View className='h-4 bg-background-secondary rounded-full' />
          <Animated.View
            style={thumbStyle}
            className={cn(
              'absolute top-4 h-24 w-24 -mt-10 rounded-full bg-background-primary border-2 border-border-primary',
            )}
          />
        </View>
      </GestureDetector>
      {stepCount > 1 && (
        <View className='flex-row justify-between'>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{options[optionKeys[0]]?.label}</AppText>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
            {options[optionKeys[stepCount - 1]]?.label}
          </AppText>
        </View>
      )}
    </View>
  );
}
