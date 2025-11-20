import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useRef } from 'react';
import { fileSystemService } from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/file-system-service';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/image-picker-service';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  IconButton,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { filesApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { FileData, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { getDocumentFormData } from '@open-web-ui-mobile-client-react-native/shared/utils/files';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';

export interface AttachmentsMenuSheetProps {
  disabled?: boolean;
  onFileUploaded?: (file: FileData) => void;
  onImageUploaded?: (image: ImageData) => void;
}

export function AttachmentsMenuSheet({
  disabled,
  onFileUploaded,
  onImageUploaded,
}: AttachmentsMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.ATTACHMENTS_ACTIONS_POPUP');
  const modalRef = useRef<BottomSheetModal>(null);
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

  return <ActionsBottomSheet
    ref={modalRef}
    renderTrigger={renderTrigger}
    actions={actions} />;
}
