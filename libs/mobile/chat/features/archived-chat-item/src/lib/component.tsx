import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { compact } from 'lodash-es';
import { Fragment, ReactElement, useRef } from 'react';
import { ChatListRow, ChatListRowProps } from '@open-webui-react-native/mobile/shared/ui/chat-list-row';
import { ActionsBottomSheet, ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi, ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { alertService } from '@open-webui-react-native/shared/utils/alert-service';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface ArchivedChatItemProps extends Partial<ChatListRowProps> {
  onItemPress: (id: string) => void;
  item: ChatListItem;
}

export function ArchivedChatItem({ item, onItemPress, ...restProps }: ArchivedChatItemProps): ReactElement {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_LIST.CHAT_ITEM');

  const actionsSheetRef = useRef<BottomSheetModal>(null);

  const { mutateAsync: deleteChat, isPending: isDeleting } = chatApi.useDelete();
  const { mutateAsync: unarchiveChat, isPending: isUnarchiving } = chatApi.useUnarchiveChat();

  const handlePress = (): void => onItemPress(item.id);
  const handleLongPress = (): void => actionsSheetRef.current?.present();

  const handleConfirmDeletePress = async (): Promise<void> => {
    await deleteChat({ id: item.id });
    actionsSheetRef.current?.close();
  };

  const showDeleteChatAlert = (): void => {
    alertService.confirm({
      title: translate('TEXT_DELETE_CHAT'),
      message: translate('TEXT_THIS_WILL_DELETE', { name: item.title }),
      confirmButtonText: translate('TEXT_DELETE'),
      cancelButtonText: translate('TEXT_KEEP'),
      confirmButtonStyle: 'destructive',
      onConfirm: handleConfirmDeletePress,
    });
  };

  const handleUnarchiveChatPress = async (): Promise<void> => {
    await unarchiveChat(item.id);
    actionsSheetRef.current?.close();
  };
  const handleExportChatPress = (): void => ToastService.showFeatureNotImplemented();

  const actions: Array<ActionSheetItemProps> = compact([
    {
      title: translate('TEXT_RESTORE'),
      iconName: 'unarchive',
      onPress: withOfflineGuard(handleUnarchiveChatPress),
      isLoading: isUnarchiving,
    },
    isFeatureEnabled(FeatureID.EXPORT_ARCHIVED_CHAT) && {
      title: translate('TEXT_EXPORT'),
      iconName: 'exportIcon',
      onPress: withOfflineGuard(handleExportChatPress),
    },
    {
      title: translate('TEXT_DELETE'),
      iconName: 'trashCan',
      onPress: withOfflineGuard(showDeleteChatAlert),
      isDanger: true,
      isLoading: isDeleting,
    },
  ]);

  return (
    <Fragment>
      <ChatListRow
        chatId={item.id}
        title={item.title}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={isUnarchiving}
        {...restProps}
      />
      <ActionsBottomSheet actions={actions} ref={actionsSheetRef} />
    </Fragment>
  );
}
