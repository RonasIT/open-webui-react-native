import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useBackHandler } from '@react-native-community/hooks';
import { Fragment, ReactElement, ReactNode, Ref, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { uiState$ } from '@open-webui-react-native/mobile/shared/ui/ui-state';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
import { View } from '../view';

export interface AppBottomSheetProps {
  detents?: Array<'auto' | number>;
  isScrollable?: boolean;
  renderTrigger?: (params: { onPress: () => void }) => ReactNode;
  content: ReactElement | ReactNode;
  isBackdropDisabled?: boolean;
  withoutKeyboardExtraPadding?: boolean;
  className?: string;
  onOpen?: () => void;
  withoutBackground?: boolean;
  onBackdropPress?: () => void;
  ref?: Ref<TrueSheet>;
}

export function AppBottomSheet({
  detents = ['auto', 0.9],
  isScrollable,
  renderTrigger,
  content,
  isBackdropDisabled,
  className,
  ref,
  onOpen,
  withoutBackground,
  onBackdropPress,
}: AppBottomSheetProps): ReactElement {
  const { top } = useSafeAreaInsets();
  const bottomInset = useBottomInset();

  const sheetRef = useRef<TrueSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  // expose imperative API to parent
  useImperativeHandle(ref, () => sheetRef.current as TrueSheet);

  const handlePresent = async () => {
    onOpen?.();
    setIsOpen(true);
    await sheetRef.current?.present();
  };

  const handleDismiss = async () => {
    setIsOpen(false);
    onBackdropPress?.();
    uiState$.isBottomSheetInputFocused.set(false);
  };

  useBackHandler(() => {
    if (isOpen) {
      sheetRef.current?.dismiss();

      return true;
    }

    return false;
  });

  const renderedTrigger = useMemo(() => renderTrigger?.({ onPress: handlePresent }), [renderTrigger]);

  const renderedContent = (
    <View
      className={cn(
        'px-content-offset pt-content-offset',
        withoutBackground ? 'bg-transparent' : 'bg-background-primary',
        className,
      )}
      // style={{ paddingBottom: bottomInset }}
    >
      {content}
    </View>
  );

  return (
    <Fragment>
      {renderedTrigger}

      <TrueSheet
        ref={sheetRef}
        detents={detents}
        cornerRadius={32}
        backgroundColor={'transparent'}
        // dismissOnBackdropPress={!isBackdropDisabled}
        // onDismiss={handleDismiss}
        // onPresent={() => setIsOpen(true)}
      >
        {renderedContent}
      </TrueSheet>
    </Fragment>
  );
}
