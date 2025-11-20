import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { compact, debounce, delay } from 'lodash-es';
import { ForwardedRef, Fragment, ReactElement, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ShareChatModal } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/share-chat-modal';
import {
  ActionButtonsModal,
  ActionButtonsModalMethods,
  ActionsBottomSheet,
  ActionSheetItemProps,
  ActionsBottomSheetProps,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { Chat, chatApi, ChatListItem } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { withOfflineGuard } from '@open-web-ui-mobile-client-react-native/shared/features/network';
import { alertService } from '@open-web-ui-mobile-client-react-native/shared/utils/alert-service';
import { FeatureID, isFeatureEnabled } from '@open-web-ui-mobile-client-react-native/shared/utils/feature-flag';
import { DownloadChatOptionsSheet } from './components';
import { ChatAction } from './enums';

export type ChatActionsMenuSheetMethods = {
  present: (chat: ChatListItem, folderId?: string) => void;
};

export type ChatActionsMenuSheetRef = ForwardedRef<ChatActionsMenuSheetMethods>;
export interface ChatActionsMenuSheetProps extends Pick<ActionsBottomSheetProps, 'onClose'> {
  goToChat: (id: string) => void;
  isPinned?: boolean;
  ref?: ChatActionsMenuSheetRef;
}

export function ChatActionsMenuSheet({ goToChat, isPinned, ref }: ChatActionsMenuSheetProps): ReactElement {
  const translate = useTranslation('SHARED.CHAT_ACTIONS_MENU_SHEET');

  const actionsSheetRef = useRef<BottomSheetModal>(null);
  const renameModalRef = useRef<ActionButtonsModalMethods>(null);
  const shareChatModalRef = useRef<BottomSheetModal>(null);
  const downloadOptionsModalRef = useRef<BottomSheetModal>(null);

  const { mutateAsync: updateChat, isPending: isUpdating } = chatApi.useUpdate();
  const { mutateAsync: deleteChat, isPending: isDeleting } = chatApi.useDelete();
  const { mutateAsync: pinChat, isPending: isPinning } = chatApi.usePinChat();
  const { mutateAsync: cloneChat, isPending: isCloning } = chatApi.useCloneChat();
  const { mutateAsync: archiveChat, isPending: isArchiving } = chatApi.useArchiveChat();

  const [activeChat, setActiveChat] = useState<ChatListItem | null>(null);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const present = withOfflineGuard((chat: ChatListItem, folderId?: string): void => {
    setActiveChat(chat);
    setFolderId(folderId);
    actionsSheetRef.current?.present();
  });

  const closeModals = (): void => {
    renameModalRef.current?.close();
    shareChatModalRef.current?.close();
    downloadOptionsModalRef.current?.close();
  };

  useImperativeHandle(
    ref,
    () => ({
      present,
    }),
    [present],
  );

  const chatId = activeChat?.id ?? '';
  const chatTitle = activeChat?.title ?? '';

  const handleAction = useMemo(
    () =>
      debounce(
        async (action: ChatAction): Promise<void> => {
          setIsLoading(true);

          switch (action) {
            case ChatAction.PIN:
              await pinChatHandler();
              break;
            case ChatAction.RENAME:
              await openRenameModal();
              break;
            case ChatAction.CLONE:
              await cloneChatHandler();
              break;
            case ChatAction.ARCHIVE:
              await archiveChatHandler();
              break;
            case ChatAction.DELETE:
              await onDeleteConfirm();
              break;
            case ChatAction.CLOSE:
              closeModals();
              break;
          }
          delay(() => setIsLoading(false), 500);
        },
        1000,
        { leading: true, trailing: false },
      ),
    [activeChat, folderId],
  );

  const closeActionsModal = (): Promise<void> =>
    // Need to delay to ensure the actions modal is closed before opening the new modal
    new Promise((resolve) => {
      actionsSheetRef?.current?.close();
      setTimeout(() => resolve(), 600);
    });

  const openRenameModal = async (): Promise<void> => {
    await closeActionsModal();
    renameModalRef.current?.present(chatTitle);
  };

  const onRenameConfirm = async (title: string): Promise<void> => {
    await updateChat({ id: chatId, chat: { title } as Chat });
    renameModalRef.current?.close();
  };

  const openDeleteAlert = async (): Promise<void> => {
    alertService.confirm({
      title: translate('TEXT_DELETE_CHAT'),
      message: translate('TEXT_THIS_WILL_DELETE', { name: chatTitle }),
      confirmButtonText: translate('TEXT_DELETE'),
      cancelButtonText: translate('TEXT_KEEP'),
      confirmButtonStyle: 'destructive',
      onConfirm: () => handleAction(ChatAction.DELETE),
    });
  };

  const onDeleteConfirm = async (): Promise<void> => {
    await deleteChat({ id: chatId, folderId });
    actionsSheetRef.current?.close();
  };

  const openShareChatModal = async (): Promise<void> => {
    await closeActionsModal();
    shareChatModalRef.current?.present();
  };

  const pinChatHandler = async (): Promise<void> => {
    await pinChat({ id: chatId, isPinned: !!isPinned });
    closeActionsModal();
  };

  const cloneChatHandler = async (): Promise<void> => {
    const res = await cloneChat({
      id: chatId,
      title: translate('TEXT_CLONE_OF', { title: chatTitle }),
    });
    closeActionsModal();

    if (res.id) {
      goToChat(res.id);
    }
  };

  const openDownloadOptionsModal = async (): Promise<void> => {
    await closeActionsModal();
    downloadOptionsModalRef.current?.present();
  };

  const archiveChatHandler = async (): Promise<void> => {
    await archiveChat({ id: chatId, folderId });
    closeActionsModal();
  };

  const actions: Array<ActionSheetItemProps> = compact([
    {
      title: isPinned ? translate('TEXT_UNPIN') : translate('TEXT_PIN'),
      iconName: isPinned ? 'unpin' : 'pin',
      isLoading: isPinning,
      onPress: () => handleAction(ChatAction.PIN),
    },
    { title: translate('TEXT_RENAME'), iconName: 'editPencil', onPress: () => handleAction(ChatAction.RENAME) },
    {
      title: translate('TEXT_CLONE'),
      iconName: 'copy',
      isLoading: isCloning,
      onPress: () => handleAction(ChatAction.CLONE),
    },
    isFeatureEnabled(FeatureID.ARCHIVE_CHAT) && {
      title: translate('TEXT_ARCHIVE'),
      iconName: 'archive',
      isLoading: isArchiving,
      onPress: () => handleAction(ChatAction.ARCHIVE),
    },
    { title: translate('TEXT_SHARE'), iconName: 'exportIcon', onPress: openShareChatModal },
    { title: translate('TEXT_DOWNLOAD'), iconName: 'download', onPress: openDownloadOptionsModal },
    {
      title: translate('TEXT_DELETE'),
      iconName: 'trashCan',
      isLoading: isDeleting,
      onPress: openDeleteAlert,
      isDanger: true,
    },
  ]);

  return (
    <Fragment>
      <ActionsBottomSheet
        areActionsDisabled={isLoading}
        actions={actions}
        ref={actionsSheetRef} />
      <ActionButtonsModal
        ref={renameModalRef}
        onConfirm={onRenameConfirm}
        isConfirming={isUpdating}
        title={translate('TEXT_RENAME_CHAT')}
        withInput
      />
      <ShareChatModal ref={shareChatModalRef} chatId={chatId} />
      <DownloadChatOptionsSheet ref={downloadOptionsModalRef} chatId={chatId} />
    </Fragment>
  );
}
