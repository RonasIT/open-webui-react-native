import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Fragment, PropsWithChildren, ReactElement, useImperativeHandle, useRef } from 'react';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  AnimatedView,
  AppPressable,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useAnimateMessage } from './hooks/use-animate-message';

interface MessageActionsSheetWrapperProps {
  actions: Array<ActionSheetItemProps>;
  isResponseGenerating?: boolean;
  sheetRef?: React.RefObject<TrueSheet | null>;
}

export function MessageActionsSheetWrapper({
  sheetRef,
  actions,
  isResponseGenerating,
  children,
}: PropsWithChildren<MessageActionsSheetWrapperProps>): ReactElement {
  const actionsSheetRef = useRef<TrueSheet>(null);
  const { animatedStyle, startAnimation, stopAnimation } = useAnimateMessage();

  const handleLongPress = (): void => {
    if (isResponseGenerating) return;

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
      }) as TrueSheet,
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
