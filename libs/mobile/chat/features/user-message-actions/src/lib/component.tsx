import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { i18n, useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { compact } from 'lodash-es';
import { PropsWithChildren, ReactElement, useRef } from 'react';
import { MessageActionsSheetWrapper } from '@open-webui-react-native/mobile/chat/ui/message-actions-wrapper';
import { ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Message } from '@open-webui-react-native/shared/data-access/api';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface UserMessageActionsProps {
  message: Message;
  onEditPress: (messageId: string, content: string) => void;
}

export function UserMessageActions({
  message,
  onEditPress,
  children,
}: PropsWithChildren<UserMessageActionsProps>): ReactElement {
  const translate = useTranslation('CHAT.USER_MESSAGE_ACTIONS');

  const actionsSheetRef = useRef<BottomSheetModal>(null);

  const copyToClipboard = async (): Promise<void> => {
    await Clipboard.setStringAsync(message.content);
    ToastService.showSuccess(i18n.t('SHARED.COMMON.TEXT_COPIED_TO_CLIPBOARD'));
    actionsSheetRef.current?.dismiss();
  };

  const handleEditPress = (): void => {
    onEditPress(message.id, message.content);
    actionsSheetRef.current?.dismiss();
  };

  const actions: Array<ActionSheetItemProps> = compact([
    isFeatureEnabled(FeatureID.USER_EDIT_MESSAGE) && {
      title: translate('TEXT_EDIT'),
      iconName: 'editPencil',
      onPress: handleEditPress,
    },
    {
      title: translate('TEXT_COPY'),
      iconName: 'copy',
      onPress: copyToClipboard,
    },
  ]);

  return (
    <MessageActionsSheetWrapper actions={actions} sheetRef={actionsSheetRef}>
      {children}
    </MessageActionsSheetWrapper>
  );
}
