import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useEffect, useRef } from 'react';
import {
  AttachKnowledgeSheet,
  AttachKnowledgeSheetMethods,
} from '@open-webui-react-native/mobile/chat/features/attach-knowledge-sheet';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { ActionsBottomSheet, ActionSheetItemProps, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi, ChatListItem, filesApi, Knowledge } from '@open-webui-react-native/shared/data-access/api';
import {
  AttachedChat,
  AttachedKnowledgeCollection,
  FileData,
  FileType,
  ImageData,
  UserRole,
} from '@open-webui-react-native/shared/data-access/common';
import { getDocumentFormData } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ReferenceChatsSheet, ReferenceChatsSheetMethods } from '../reference-chats-sheet';

export interface AttachmentsMenuSheetProps {
  disabled?: boolean;
  onFileUploaded?: (file: FileData) => void;
  onImageUploaded?: (image: ImageData) => void;
  isKnowledgeCollectionAttached: (id: string) => boolean;
  isKnowledgeFileAttached: (id: string) => boolean;
  onKnowledgeCollectionSelected: (collection: AttachedKnowledgeCollection) => void;
  onKnowledgeFileSelected: (file: FileData) => void;
  chatId?: string;
  attachedChatIds: Array<string>;
  onChatSelected: (chat: AttachedChat) => void;
}

export function AttachmentsMenuSheet({
  disabled,
  onFileUploaded,
  onImageUploaded,
  isKnowledgeCollectionAttached,
  isKnowledgeFileAttached,
  onKnowledgeCollectionSelected,
  onKnowledgeFileSelected,
  chatId,
  attachedChatIds,
  onChatSelected,
}: AttachmentsMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.ATTACHMENTS_ACTIONS_POPUP');
  const modalRef = useRef<BottomSheetModal>(null);
  const attachKnowledgeSheetRef = useRef<AttachKnowledgeSheetMethods>(null);
  const referenceChatsSheetRef = useRef<ReferenceChatsSheetMethods>(null);
  const { data: profile } = authApi.useGetProfile();
  const isFileUploadEnabled =
    !profile || profile.role === UserRole.ADMIN || Boolean(profile.permissions?.chat?.fileUpload);
  const {
    mutate: uploadFile,
    isPending: isFileUploading,
    isSuccess: isFileUploaded,
    data: file,
  } = filesApi.useUploadFile();

  const closeModal = (): void => modalRef.current?.close();

  const handlePickImage = async (source: ImagePickerSource): Promise<void> => {
    const image = await imagePickerService.getImage(source);
    const asset = image?.assets?.[0];

    if (!asset || !asset.base64) {
      return;
    }

    closeModal();
    onImageUploaded?.({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType });
  };

  // TODO: Move into hook when attach to message will be implemented
  const handlePickFile = async (): Promise<void> => {
    const { assets } = await fileSystemService.pickFile({ multiple: false });

    if (!assets) {
      return;
    }

    const file = assets?.[0];

    if (file.size === 0) {
      ToastService.showError(translate('TEXT_YOU_CANNOT_UPLOAD_EMPTY_FILE'));

      return;
    }

    if (file.mimeType && file.mimeType.startsWith('image/')) {
      const imageBase64 = await fileSystemService.convertToBase64(file.uri);

      closeModal();

      return onImageUploaded?.({ uri: file.uri, base64: imageBase64, mimeType: file.mimeType });
    }

    uploadFile(getDocumentFormData(file));
  };

  const handleAttachKnowledgePress = (): void => {
    closeModal();
    attachKnowledgeSheetRef.current?.present();
  };

  const handleReferenceChatsPress = (): void => {
    closeModal();
    referenceChatsSheetRef.current?.present();
  };

  const handleSelectChat = (chat: ChatListItem): void => {
    onChatSelected(
      new AttachedChat({
        id: chat.id,
        type: FileType.CHAT,
        name: chat.title,
        status: 'processed',
      }),
    );
  };

  const handleSelectKnowledgeCollection = (knowledge: Knowledge): void => {
    onKnowledgeCollectionSelected(
      new AttachedKnowledgeCollection({
        id: knowledge.id,
        type: FileType.COLLECTION,
        name: knowledge.name,
        description: knowledge.description,
        status: 'processed',
      }),
    );
  };

  // NOTE: the file already carries everything needed (id, meta, collectionName) straight from
  // GET /knowledge/{id}/files — no need to reconstruct it, unlike the collection case below.
  const handleSelectKnowledgeFile = (_knowledge: Knowledge, file: FileData): void => {
    onKnowledgeFileSelected(file);
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_CAPTURE'),
      iconName: 'camera',
      onPress: () => handlePickImage(ImagePickerSource.CAMERA),
    },
    {
      title: translate('TEXT_CHOOSE_FROM_GALLERY'),
      iconName: 'gallery',
      onPress: () => handlePickImage(ImagePickerSource.GALLERY),
    },
    {
      title: translate('TEXT_UPLOAD_FILES'),
      iconName: 'uploadFile',
      onPress: handlePickFile,
      isLoading: isFileUploading,
    },
    {
      title: translate('TEXT_ATTACH_KNOWLEDGE'),
      iconName: 'database',
      onPress: handleAttachKnowledgePress,
    },
    {
      title: translate('TEXT_REFERENCE_CHATS'),
      iconName: 'history',
      onPress: handleReferenceChatsPress,
      disabled: !isFileUploadEnabled,
    },
  ];

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <IconButton
      disabled={disabled}
      iconName='plus'
      onPress={onPress}
      className='p-0' />
  );

  useEffect(() => {
    if (isFileUploaded) {
      closeModal();
      onFileUploaded?.(file);
    }
  }, [isFileUploaded]);

  return (
    <Fragment>
      <ActionsBottomSheet
        ref={modalRef}
        renderTrigger={renderTrigger}
        actions={actions} />
      <AttachKnowledgeSheet
        ref={attachKnowledgeSheetRef}
        isCollectionAttached={isKnowledgeCollectionAttached}
        isFileAttached={isKnowledgeFileAttached}
        onSelectCollection={handleSelectKnowledgeCollection}
        onSelectFile={handleSelectKnowledgeFile}
      />
      <ReferenceChatsSheet
        ref={referenceChatsSheetRef}
        chatId={chatId}
        attachedChatIds={attachedChatIds}
        onSelectChat={handleSelectChat}
      />
    </Fragment>
  );
}
