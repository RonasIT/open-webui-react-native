import { ReactElement, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ModelControlOption } from '@open-webui-react-native/shared/data-access/api';

const thumbSize = 24;
const animationDuration = 150;

export interface OptionSliderProps {
  options: Record<string, ModelControlOption>;
  choice?: string;
  defaultOptionKey?: string;
  onOptionChange: (optionKey: string) => void;
}

export function OptionSlider({ options, choice, defaultOptionKey, onOptionChange }: OptionSliderProps): ReactElement {
  const optionKeys = Object.keys(options);
  const stepCount = optionKeys.length;
  const currentIndex = optionKeys.indexOf(choice ?? defaultOptionKey ?? '');
  const selectedIndex = Math.max(0, currentIndex);

  const [trackWidth, setTrackWidth] = useState(0);
  //NOTE: Option shown in the tooltip while dragging.
  const [dragIndex, setDragIndex] = useState(selectedIndex);

  const isDragging = useSharedValue(false);
  const dragOffset = useSharedValue(0);
  const dragStartOffset = useSharedValue(0);
  const tooltipWidth = useSharedValue(0);
  //NOTE: Index dropped by the last drag; the thumb stays there until the parent passes it back as the choice.
  const droppedIndex = useSharedValue(-1);
  //NOTE: Mirrors dragIndex on the UI thread, so the JS thread is called only when the option changes.
  const dragIndexOnUi = useSharedValue(selectedIndex);

  const stepWidth = stepCount > 1 ? (trackWidth - thumbSize) / (stepCount - 1) : 0;
  const maxOffset = trackWidth - thumbSize;
  const selectedOffset = selectedIndex * stepWidth;

  //NOTE: The parent took the dropped option or reset the choice, so the thumb follows the choice again.
  useEffect(() => {
    droppedIndex.value = -1;
  }, [selectedIndex, droppedIndex]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handleTooltipLayout = (event: LayoutChangeEvent): void => {
    tooltipWidth.value = event.nativeEvent.layout.width;
  };

  const selectIndex = (index: number): void => {
    if (index === currentIndex) {
      return;
    }

    onOptionChange(optionKeys[index]);
  };

  //NOTE: Pan starts only after a horizontal move, so vertical swipes still scroll the sheet.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart(() => {
      droppedIndex.value = -1;
      dragStartOffset.value = selectedOffset;
      dragOffset.value = selectedOffset;
      isDragging.value = true;
      dragIndexOnUi.value = selectedIndex;
      scheduleOnRN(setDragIndex, selectedIndex);
    })
    .onUpdate((event) => {
      const offset = Math.min(Math.max(dragStartOffset.value + event.translationX, 0), maxOffset);
      const index = Math.round(offset / stepWidth);
      dragOffset.value = offset;

      if (index !== dragIndexOnUi.value) {
        dragIndexOnUi.value = index;
        scheduleOnRN(setDragIndex, index);
      }
    })
    .onEnd(() => {
      const index = Math.round(dragOffset.value / stepWidth);
      dragOffset.value = withTiming(index * stepWidth, { duration: animationDuration });
      droppedIndex.value = index;
      isDragging.value = false;
      scheduleOnRN(selectIndex, index);
    });

  const tapGesture = Gesture.Tap().onEnd((event) => {
    droppedIndex.value = -1;
    const offset = Math.min(Math.max(event.x - thumbSize / 2, 0), maxOffset);
    scheduleOnRN(selectIndex, Math.round(offset / stepWidth));
  });

  const isEnabled = stepCount > 1 && trackWidth > 0;
  const gesture = Gesture.Exclusive(panGesture.enabled(isEnabled), tapGesture.enabled(isEnabled));

  // The thumb follows the finger, then glides to the selected option.
  const thumbPosition = useDerivedValue(() => {
    const isFollowingGesture = isDragging.value || (droppedIndex.value !== -1 && droppedIndex.value !== selectedIndex);

    return isFollowingGesture ? dragOffset.value : withTiming(selectedOffset, { duration: animationDuration });
  }, [selectedIndex, selectedOffset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }],
  }));

  const rangeStyle = useAnimatedStyle(() => ({
    width: thumbPosition.value + thumbSize / 2,
  }));

  // Centred over the thumb, but kept inside the track so the sheet does not clip it at the ends.
  const tooltipStyle = useAnimatedStyle(() => {
    const centredOffset = dragOffset.value + thumbSize / 2 - tooltipWidth.value / 2;

    return {
      opacity: withTiming(isDragging.value ? 1 : 0, { duration: animationDuration }),
      transform: [{ translateX: Math.min(Math.max(centredOffset, 0), trackWidth - tooltipWidth.value) }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View className='h-24 justify-center' onLayout={handleTrackLayout}>
        <View className='h-[3px] bg-text-tertiary' />
        <Animated.View style={rangeStyle} className='absolute left-0 h-[3px] bg-brand-primary' />
        <Animated.View
          style={thumbStyle}
          className='absolute left-0 h-24 w-24 items-center justify-center rounded-full bg-brand-primary'>
          <View className='h-8 w-8 rounded-full bg-text-foreground' />
        </Animated.View>
        <Animated.View
          pointerEvents='none'
          style={tooltipStyle}
          onLayout={handleTooltipLayout}
          className='absolute -top-48 left-0 bg-text-primary px-12 py-8 rounded-lg'>
          <AppText numberOfLines={1} className='text-sm-sm sm:text-sm text-background-primary'>
            {options[optionKeys[dragIndex]]?.label}
          </AppText>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
