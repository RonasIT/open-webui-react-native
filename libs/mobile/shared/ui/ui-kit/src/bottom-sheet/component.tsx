import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useBackHandler } from '@react-native-community/hooks';
import { Fragment, ReactElement, ReactNode, Ref, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
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
  scrollable?: boolean;
  header?: ReactElement;
  cornerRadius?: number;
  dimmed?: boolean;
}

export type AppBottomSheetPropsType = AppBottomSheetProps;

export function AppBottomSheet({
  detents = ['auto', 0.9],
  scrollable,
  renderTrigger,
  content,
  header,
  className,
  ref,
  onOpen,
  withoutBackground,
  cornerRadius,
  dimmed = true,
}: AppBottomSheetProps): ReactElement {
  const sheetRef = useRef<TrueSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  // expose imperative API to parent
  useImperativeHandle(ref, () => sheetRef.current as TrueSheet);

  const handlePresent = async () => {
    onOpen?.();
    setIsOpen(true);
    await sheetRef.current?.present();
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
        !scrollable && 'px-content-offset pt-content-offset',
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
        backgroundColor={'transparent'}
        draggable={false}
        scrollable={scrollable}
        header={header}
        cornerRadius={cornerRadius}
        dimmed={dimmed}
        stackBehavior='switch'
        // dismissOnBackdropPress={!isBackdropDisabled}
        // onDismiss={handleDismiss}
        // onPresent={() => setIsOpen(true)}
      >
        {renderedContent}
      </TrueSheet>
    </Fragment>
  );
}
