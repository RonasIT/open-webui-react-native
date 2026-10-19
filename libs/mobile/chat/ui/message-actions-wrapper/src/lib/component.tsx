import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Fragment, PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useRef } from 'react';
import { AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  AnimatedView,
  hapticImpactHandler,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useAnimateMessage } from './hooks/use-animate-message';

interface MessageActionsSheetWrapperProps {
  actions: Array<ActionSheetItemProps>;
  sheetRef?: React.RefObject<BottomSheetModal | null>;
}

export function MessageActionsSheetWrapper({
  sheetRef,
  actions,
  children,
}: PropsWithChildren<MessageActionsSheetWrapperProps>): ReactElement {
  const actionsSheetRef = useRef<BottomSheetModal>(null);
  const { animatedStyle, startAnimation, stopAnimation } = useAnimateMessage();

  const handleLongPress = (): void => {
    hapticImpactHandler();
    startAnimation();
    actionsSheetRef.current?.present();
  };

  const longPressGesture = useMemo(() => Gesture.LongPress().runOnJS(true).onStart(handleLongPress), []);

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'longpress') handleLongPress();
  };

  const handleDismissActionsSheet = (): void => {
    stopAnimation();
    actionsSheetRef.current?.dismiss();
  };

  useImperativeHandle(
    sheetRef,
    () =>
      ({
        ...actionsSheetRef.current,
        present: () => {
          startAnimation();
          actionsSheetRef.current?.present();
        },
        dismiss: handleDismissActionsSheet,
      }) as BottomSheetModal,
  );

  return (
    <Fragment>
      <ActionsBottomSheet
        onClose={handleDismissActionsSheet}
        onBackdropPress={handleDismissActionsSheet}
        actions={actions}
        ref={actionsSheetRef}
      />
      <AnimatedView style={animatedStyle}>
        <GestureDetector gesture={longPressGesture}>
          <View
            accessible
            accessibilityActions={[{ name: 'longpress' }]}
            onAccessibilityAction={handleAccessibilityAction}>
            {children}
          </View>
        </GestureDetector>
      </AnimatedView>
    </Fragment>
  );
}
