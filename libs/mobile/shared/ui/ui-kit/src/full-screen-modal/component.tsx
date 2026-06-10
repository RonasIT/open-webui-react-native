import { ReactElement, ReactNode } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStyles } from '@open-webui-react-native/mobile/shared/ui/styles';

interface FullScreenModalProps extends Partial<ModalProps> {
  children: ReactNode;
}

export function FullScreenModal({ style, children, ...restProps }: FullScreenModalProps): ReactElement {
  return (
    <Modal
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      hasBackdrop={false}
      animationInTiming={100}
      animationOutTiming={100}
      style={[styles.container, style]}
      {...restProps}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </Modal>
  );
}

const styles = createStyles({
  container: {
    margin: 0,
  },
});
