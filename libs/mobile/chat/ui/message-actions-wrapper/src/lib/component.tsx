import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Fragment, PropsWithChildren, ReactElement, useImperativeHandle, useRef } from 'react';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  AnimatedView,
  AppPressable,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useAnimateMessage } from './hooks/use-animate-message';

interface MessageActionsSheetWrapperProps {
  sheetRef?: React.RefObject<BottomSheetModal | null>;
  actions: Array<ActionSheetItemProps>;
}

export function MessageActionsSheetWrapper({
  sheetRef,
  actions,
  children,
}: PropsWithChildren<MessageActionsSheetWrapperProps>): ReactElement {
  const actionsSheetRef = useRef<BottomSheetModal>(null);
  const { animatedStyle, startAnimation, stopAnimation } = useAnimateMessage();

  const handleLongPress = (): void => {
    startAnimation();
    actionsSheetRef.current?.present();
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
        <AppPressable className='active:opacity-100' onLongPress={handleLongPress}>
          {children}
        </AppPressable>
      </AnimatedView>
    </Fragment>
  );
}
