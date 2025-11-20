import { ReactElement, ReactNode } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { createStyles } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

interface FullScreenModalProps extends Partial<ModalProps> {
  children: ReactNode;
}

export function FullScreenModal({ style, ...restProps }: FullScreenModalProps): ReactElement {
  return (
    <Modal
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      hasBackdrop={false}
      animationInTiming={100}
      animationOutTiming={100}
      style={[styles.container, style]}
      {...restProps}
    />
  );
}

const styles = createStyles({
  container: {
    margin: 0,
  },
});
