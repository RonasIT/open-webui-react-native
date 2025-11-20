import { useState, ReactElement, PropsWithChildren, useImperativeHandle, ForwardedRef } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { IconButton } from '../icon-button';
import { AppToast } from '../toast';
import { View } from '../view';

export interface AppModalHandle {
  open: () => void;
  close: () => void;
}

export type AppModalRef = ForwardedRef<AppModalHandle>;

export interface AppModalProps extends PropsWithChildren<Partial<ModalProps>> {
  modalRef?: AppModalRef;
}

export function AppModal({ modalRef, children, ...modalProps }: AppModalProps): ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  const open = (): void => setIsVisible(true);

  const close = (): void => setIsVisible(false);

  useImperativeHandle(modalRef, () => ({ open, close }), []);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={close}
      className='overflow-hidden'
      backdropOpacity={0.5}
      backdropTransitionOutTiming={1}
      hideModalContentWhileAnimating={true}
      animationIn='fadeIn'
      {...modalProps}>
      {isVisible && (
        <View className='bg-background-primary px-24 py-20 rounded-xl border border-text-secondary'>
          {children}
          <IconButton
            iconName='close'
            hitSlop={8}
            onPress={close}
            className='absolute active:opacity-1 active:bg-background-secondary bg-background-primary border border-text-secondary p-0 rounded-full items-center justify-center w-[24] h-[24] top-4 right-4'
            iconProps={{ className: 'color-text-primary', width: 16 }}
          />
        </View>
      )}
      <AppToast />
    </Modal>
  );
}
