import { useObservable } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { isAxiosError } from 'axios';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { compressImage } from '@open-webui-react-native/mobile/shared/utils/compressor';
import { filesApi, isFeaturePermitted } from '@open-webui-react-native/shared/data-access/api';
import {
  AttachedListItem,
  AttachmentStatus,
  getAttachedListItemId,
  ImageData,
  PickedImageData,
} from '@open-webui-react-native/shared/data-access/common';
import { ImageMimeType } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface UseAttachedFilesArgs {
  // NOTE: Off for temporary chats, which keep images inline as on the web, and for anything that is
  // not sent to Open WebUI at all (support requests).
  shouldUploadImages?: boolean;
}

export function useAttachedFiles({ shouldUploadImages = false }: UseAttachedFilesArgs = {}): typeof result {
  const attachedItems = useObservable<Array<AttachedListItem>>([]);
  const attachedImages = useObservable<Array<ImageData>>([]);
  const translate = useTranslation('SHARED.USE_ATTACHED_FILES');

  const { mutateAsync: uploadImage } = filesApi.useUploadImage();

  // NOTE: The backend does not check `chat.file_upload` on POST /files — the web client enforces it,
  // so without that permission images stay inline, as they were before uploading existed.
  const isImageUploadEnabled = shouldUploadImages && isFeaturePermitted('chat', 'fileUpload', true);

  const handleItemAttached = (item: AttachedListItem): void => {
    attachedItems.set((prev) =>
      prev.some((attached) => getAttachedListItemId(attached) === getAttachedListItemId(item)) ? prev : [...prev, item],
    );
  };

  const handleDeleteItem = (id: string): void => {
    attachedItems.set((prev) => prev.filter((item) => getAttachedListItemId(item) !== id));
  };

  const handleDeleteImage = (uri: string): void => {
    attachedImages.set((prev) => prev.filter((image) => image.uri !== uri));
  };

  const updateImage = (uri: string, changes: Partial<ImageData>): void => {
    attachedImages.set((prev) => prev.map((image) => (image.uri === uri ? { ...image, ...changes } : image)));
  };

  const handleImageUploaded = async (image: PickedImageData): Promise<void> => {
    let processed: ImageData;

    if (image.mimeType === ImageMimeType.HEIC) {
      const compressed = await compressImage(image.uri, { output: 'jpg' });
      processed = {
        mimeType: ImageMimeType.JPEG,
        uri: compressed,
        base64: await fileSystemService.convertToBase64(compressed),
        fileName: image.fileName,
      };
    } else {
      // NOTE: expo-image-picker only base64-encodes images, not videos, and the document picker never
      // does, so anything without it is read from disk
      processed = {
        ...image,
        base64: image.base64 || (await fileSystemService.convertToBase64(image.uri)),
      };
    }

    if (!isImageUploadEnabled) {
      attachedImages.set((prev) => [...prev, processed]);

      return;
    }

    // NOTE: Uploaded right away, as the web app does, so a failure surfaces while the image is still
    // in the composer rather than after the message is gone.
    attachedImages.set((prev) => [...prev, { ...processed, status: AttachmentStatus.UPLOADING }]);

    try {
      const file = await uploadImage(processed);

      updateImage(processed.uri, {
        fileId: file.id,
        contentType: file.meta?.contentType ?? processed.mimeType,
        status: AttachmentStatus.UPLOADED,
      });
    } catch (error) {
      // NOTE: The api-client interceptor toasts every server error but stays silent on network
      // failures, so only those need a toast here. The image stays as an error chip until removed.
      if (isAxiosError(error) && !error.response) {
        ToastService.showError(translate('TEXT_IMAGE_UPLOAD_FAILED'));
      }

      updateImage(processed.uri, { status: AttachmentStatus.ERROR });
    }
  };

  const resetAttachments = (): void => {
    attachedItems.set([]);
    attachedImages.set([]);
  };

  const result = {
    attachedItems,
    handleItemAttached,
    handleDeleteItem,
    attachedImages,
    handleImageUploaded,
    handleDeleteImage,
    resetAttachments,
  };

  return result;
}
