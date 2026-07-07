import BottomSheet, {
  BottomSheetMethods,
  BottomSheetModal,
  BottomSheetProps,
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';
import { useBackHandler } from '@react-native-community/hooks';
import { delay } from 'lodash-es';
import { remapProps } from 'nativewind';

import { Fragment, ReactElement, ReactNode, Ref, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { ViewProps } from 'react-native';
import { SetOptional } from 'type-fest';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { uiState$ } from '@open-webui-react-native/mobile/shared/ui/ui-state';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
import { View } from '../view';

type BottomSheetModalProps = BottomSheetProps & {
  stackBehavior?: 'push' | 'switch' | 'replace';
};

type NativeWindProps = {
  className?: string;
  backgroundClassName?: string;
  handleIndicatorClassName?: string;
};

const CustomizedBottomSheet = remapProps(BottomSheet, {
  className: 'style',
  handleIndicatorClassName: 'handleIndicatorStyle',
  backgroundClassName: 'backgroundStyle',
}) as React.ForwardRefExoticComponent<BottomSheetProps & NativeWindProps & React.RefAttributes<BottomSheetMethods>>;

const CustomizedBottomSheetModal = remapProps(BottomSheetModal, {
  className: 'style',
  handleIndicatorClassName: 'handleIndicatorStyle',
  backgroundClassName: 'backgroundStyle',
}) as React.ForwardRefExoticComponent<BottomSheetModalProps & NativeWindProps & React.RefAttributes<BottomSheetModal>>;

export interface AppBottomSheetProps {
  initialSnapPoints?: Array<string | number>;
  isScrollable?: boolean;
  renderTrigger?: (params: { onPress: () => void }) => ReactNode;
  content: ReactElement | ReactNode;
  isModal?: boolean;
  withoutKeyboardExtraPadding?: boolean;
  bottomSheetHandleOptions?: ViewProps;
  className?: string;
  onOpen?: () => void;
  withoutBackground?: boolean;
  stackBehavior?: BottomSheetModalProps['stackBehavior'];
}

export interface AppBottomSheetNonModalProps extends SetOptional<BottomSheetProps, 'snapPoints' | 'children'> {
  isModal?: false;
  ref?: Ref<BottomSheetMethods>;
}

export interface AppBottomSheetModalProps extends SetOptional<BottomSheetModalProps, 'snapPoints' | 'children'> {
  isModal: true;
  ref?: Ref<BottomSheetMethods>;
}

export type AppBottomSheetPropsType = AppBottomSheetProps & (AppBottomSheetNonModalProps | AppBottomSheetModalProps);

export function AppBottomSheet({
  style: elementStyle,
  initialSnapPoints,
  snapPoints,
  children,
  isScrollable,
  renderTrigger,
  content,
  isModal = true,
  className,
  ref,
  onOpen,
  withoutBackground,
  onChange,
  onClose,
  onDismiss,
  stackBehavior: _stackBehavior,
  ...restProps
}: AppBottomSheetPropsType): ReactElement {
  const bottomInset = useBottomInset();
  const elementRef = useRef<BottomSheetMethods>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const resolvedSnapPoints = snapPoints ?? initialSnapPoints;

  const renderedContent = isScrollable ? (
    <View className='flex-1 px-content-offset pt-content-offset'>{content}</View>
  ) : (
    <BottomSheetView>
      <View className='px-content-offset pt-content-offset' style={{ paddingBottom: bottomInset }}>
        {content}
      </View>
    </BottomSheetView>
  );

  const renderedTrigger = useMemo(
    () => renderTrigger?.({ onPress: () => elementRef?.current?.present() }),
    [elementRef, renderTrigger],
  );

  const handleChange = (index: number): void => {
    onChange?.(index);

    if (index !== -1) {
      onOpen?.();

      return setIsSheetOpen(true);
    }

    onClose?.();
    onDismiss?.();

    setIsSheetOpen(false);
    delay(() => uiState$.isBottomSheetInputFocused.set(false), 500);
  };

  useImperativeHandle(ref, () => elementRef.current as BottomSheetMethods);

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
        onChange={handleChange}
        backgroundClassName={cn('bg-background-primary', withoutBackground && 'bg-transparent')}
        className={cn('rounded-5xl overflow-hidden', className)}
        enableDynamicSizing={!isScrollable}
        snapPoints={resolvedSnapPoints}
        handleComponent={() => null}
        ref={elementRef}
        enablePanDownToClose={true}
        {...restProps}>
        {renderedContent}
      </Component>
    </Fragment>
  );
}
