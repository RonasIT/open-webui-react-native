import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useBackHandler, useKeyboard } from '@react-native-community/hooks';
import { delay } from 'lodash-es';
import { remapProps } from 'nativewind';

import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Keyboard, Platform, TouchableWithoutFeedback, ViewProps, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SetOptional } from 'type-fest';
import { cn, screenHeight } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { uiState$ } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-state';
import { View } from '../view';

const CustomizedBottomSheet = remapProps(BottomSheet, {
  className: 'style',
  handleIndicatorClassName: 'handleIndicatorStyle',
  backgroundClassName: 'backgroundStyle',
});

const CustomizedBottomSheetModal = remapProps(BottomSheetModal, {
  className: 'style',
  handleIndicatorClassName: 'handleIndicatorStyle',
  backgroundClassName: 'backgroundStyle',
});

export interface AppBottomSheetProps {
  initialSnapPoints?: Array<string | number>;
  isScrollable?: boolean;
  renderTrigger?: (params: { onPress: () => void }) => ReactNode;
  content: ReactElement | ReactNode;
  isBackdropDisabled?: boolean;
  isModal?: boolean;
  withoutKeyboardExtraPadding?: boolean;
  bottomSheetHandleOptions?: ViewProps;
  className?: string;
  onOpen?: () => void;
  withoutBackground?: boolean;
  onBackdropPress?: () => void;
}

export interface AppBottomSheetNonModalProps extends SetOptional<BottomSheetProps, 'snapPoints' | 'children'> {
  isModal?: false;
  ref?: Ref<BottomSheet>;
}

export interface AppBottomSheetModalProps extends SetOptional<BottomSheetModalProps, 'snapPoints' | 'children'> {
  isModal: true;
  ref?: Ref<BottomSheetModal>;
}

export type AppBottomSheetPropsType = AppBottomSheetProps & (AppBottomSheetNonModalProps | AppBottomSheetModalProps);

export function AppBottomSheet({
  style: elementStyle,
  snapPoints,
  children,
  isScrollable,
  renderTrigger,
  content,
  isBackdropDisabled,
  isModal = true,
  withoutKeyboardExtraPadding,
  bottomSheetHandleOptions,
  className,
  ref,
  onOpen,
  withoutBackground,
  onBackdropPress,
  ...restProps
}: AppBottomSheetPropsType): ReactElement {
  const { top } = useSafeAreaInsets();
  const { keyboardHeight, keyboardShown } = useKeyboard();
  const elementRef = useRef<BottomSheetModal>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleBackdropPress = (): void => {
    onBackdropPress?.();
    elementRef.current?.close();
  };

  const renderBackdrop = useCallback(
    () =>
      isBackdropDisabled ? null : (
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle, { backgroundColor: 'black' }]} />
        </TouchableWithoutFeedback>
      ),
    [isBackdropDisabled, animatedStyle],
  );

  const renderBackground = useCallback(
    ({ style }: BottomSheetBackgroundProps) => (
      <View className={cn(`bg-background-primary rounded-2xl`, withoutBackground && 'bg-transparent')} style={style} />
    ),
    [withoutBackground],
  );

  const renderedContent = isScrollable ? (
    <View className='flex-1'>{content}</View>
  ) : (
    <BottomSheetView
      className={cn(
        keyboardShown && !withoutKeyboardExtraPadding
          ? `pb-[${keyboardHeight}]`
          : Platform.OS === 'ios'
            ? 'pb-safe'
            : 'pb-16',
      )}>
      {content}
    </BottomSheetView>
  );

  const renderedTrigger = useMemo(
    () => renderTrigger?.({ onPress: () => elementRef?.current?.present() }),
    [elementRef, renderTrigger],
  );

  const handleChange = (index: number): void => {
    if (index !== -1) {
      onOpen?.();

      return setIsSheetOpen(true);
    }
    setIsSheetOpen(false);
    delay(() => uiState$.isBottomSheetInputFocused.set(false), 500);
  };

  const handleAnimate = (fromIndex: number, toIndex: number, fromPosition: number, toPosition: number): void => {
    if (keyboardShown && fromIndex !== 0) {
      Keyboard.dismiss();
    }

    if (fromIndex < 0) {
      opacity.value = withTiming(0.2, { duration: 200 });
    }

    if (toPosition === screenHeight - top) {
      opacity.value = withTiming(0, { duration: 200 });
    }
  };

  useImperativeHandle(ref, () => elementRef.current as BottomSheetModal);

  useBackHandler(() => {
    if (isSheetOpen && elementRef.current) {
      elementRef.current?.close();

      return true;
    }

    return false;
  });

  const Component = useMemo(() => (isModal ? CustomizedBottomSheetModal : CustomizedBottomSheet), [isModal]);

  return (
    <Fragment>
      {renderedTrigger && renderedTrigger}
      <Component
        topInset={top || 50}
        backgroundComponent={renderBackground}
        backgroundClassName='rounded-5xl'
        onChange={handleChange}
        className={cn('rounded-5xl overflow-hidden px-content-offset pt-content-offset', className)}
        enableDynamicSizing={!isScrollable}
        onAnimate={handleAnimate}
        snapPoints={snapPoints}
        handleComponent={() => null}
        ref={elementRef}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        {...restProps}>
        {renderedContent}
      </Component>
    </Fragment>
  );
}
