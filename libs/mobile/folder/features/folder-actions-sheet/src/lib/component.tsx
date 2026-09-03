import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import {
  ActionsBottomSheet,
  ActionsBottomSheetProps,
  ActionSheetItemProps,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  authApi,
  ChatResponse,
  FolderListItem,
  foldersApi,
  foldersApiConfig,
  foldersService,
} from '@open-webui-react-native/shared/data-access/api';
import { UserRole } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { alertService } from '@open-webui-react-native/shared/utils/alert-service';

export type FolderActionsSheetMethods = {
  present: (folder: FolderListItem) => void;
};

export type FolderActionsSheetRef = ForwardedRef<FolderActionsSheetMethods>;

export interface FolderActionsSheetProps extends Pick<ActionsBottomSheetProps, 'onClose'> {
  onEditPress: (id: string) => void;
  onSharePress: (folder: FolderListItem) => void;
  ref?: FolderActionsSheetRef;
}

export function FolderActionsSheet({ onEditPress, onSharePress, ref }: FolderActionsSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.FOLDER_ACTIONS_SHEET');
  const actionsSheetRef = useRef<BottomSheetModal>(null);

  const [folder, setFolder] = useState<FolderListItem | undefined>();
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false);

  const { data: profile } = authApi.useGetProfile();
  const { mutateAsync: deleteFolder, isPending: isDeleting } = foldersApi.useDeleteFolder();

  const isAdmin = profile?.role === UserRole.ADMIN;

  const getFolderChats = async (id: string): Promise<Array<ChatResponse>> =>
    await queryClient.fetchQuery<Array<ChatResponse>>({
      queryKey: foldersApiConfig.getFolderChatsQueryKey(id),
      queryFn: () => foldersService.getFolderChats(id),
    });

  const present = (folder: FolderListItem): void => {
    setFolder(folder);
    actionsSheetRef.current?.present();
  };

  const closeActionsModal = (): Promise<void> =>
    // Need to delay to ensure the actions modal is closed before opening the new modal
    new Promise((resolve) => {
      actionsSheetRef?.current?.close();
      setTimeout(() => resolve(), 500);
    });

  useImperativeHandle(ref, () => {
    return {
      present,
    };
  }, []);

  const openDeleteAlert = async (): Promise<void> => {
    alertService.confirm({
      title: translate('TEXT_DELETE_FOLDER'),
      message: translate('TEXT_THIS_WILL_DELETE', { name: folder?.name }),
      confirmButtonText: translate('TEXT_DELETE'),
      cancelButtonText: translate('TEXT_KEEP'),
      confirmButtonStyle: 'destructive',
      onConfirm: onDeleteConfirm,
    });
  };

  const onDeleteConfirm = async (): Promise<void> => {
    if (folder) {
      await deleteFolder(folder.id);
    }
    closeActionsModal();
  };

  const onChatsExport = async (): Promise<void> => {
    setIsExportLoading(true);

    if (folder) {
      const chats = await getFolderChats(folder.id);
      const jsonData = JSON.stringify(chats, null, 2);
      await fileSystemService.shareJsonFile(`folder-${folder.name}-export-${Date.now()}`, jsonData);
    }
    setIsExportLoading(false);
  };

  const onEditPressHandler = async (): Promise<void> => {
    await closeActionsModal();

    if (folder) {
      onEditPress(folder.id);
    }
  };

  const onSharePressHandler = async (): Promise<void> => {
    await closeActionsModal();

    if (folder) {
      onSharePress(folder);
    }
  };

  const shareAction: ActionSheetItemProps = {
    title: translate('TEXT_SHARE'),
    iconName: 'users',
    onPress: onSharePressHandler,
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_EDIT'),
      iconName: 'editPencil',
      onPress: onEditPressHandler,
    },
    ...(isAdmin ? [shareAction] : []),
    {
      title: translate('TEXT_EXPORT'),
      iconName: 'exportIcon',
      onPress: onChatsExport,
      isLoading: isExportLoading,
    },
    {
      title: translate('TEXT_DELETE'),
      iconName: 'trashCan',
      onPress: openDeleteAlert,
      isLoading: isDeleting,
      isDanger: true,
    },
  ];

  return <ActionsBottomSheet actions={actions} ref={actionsSheetRef} />;
}
