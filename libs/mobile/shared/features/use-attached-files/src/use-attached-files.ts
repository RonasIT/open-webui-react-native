import { useObservable } from '@legendapp/state/react';
import { isAxiosError } from 'axios';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { ImageMimeType } from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { compressImage } from '@open-webui-react-native/mobile/shared/utils/compressor';
import { authApi, filesApi, isFeaturePermitted } from '@open-webui-react-native/shared/data-access/api';
import { AttachedListItem, getAttachedListItemId, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface UseAttachedFilesArgs {
  // NOTE: Off for temporary chats, which keep images inline as on the web, and for anything that is
  // not sent to Open WebUI at all (support requests).
  shouldUploadImages?: boolean;
}

export function useAttachedFiles({ shouldUploadImages = false }: UseAttachedFilesArgs = {}): typeof result {
  const attachedItems = useObservable<Array<AttachedListItem>>([]);
  const attachedImages = useObservable<Array<ImageData>>([]);

  const { mutateAsync: uploadImage } = filesApi.useUploadImage();

  // NOTE: The backend does not check `chat.file_upload` on POST /files — the web client enforces it,
  // so without that permission images stay inline, as they were before uploading existed.
  const { data: profile } = authApi.useGetProfile();
  const isImageUploadEnabled = shouldUploadImages && isFeaturePermitted(profile?.permissions?.chat?.fileUpload, true);

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

  const handleImageUploaded = async (image: ImageData): Promise<void> => {
    let processed = image;

    if (image.mimeType === ImageMimeType.HEIC) {
      const compressed = await compressImage(image.uri, { output: 'jpg' });
      processed = {
        mimeType: ImageMimeType.JPEG,
        uri: compressed,
        base64: await fileSystemService.convertToBase64(compressed),
        fileName: image.fileName,
      };
    } else if (!image.base64) {
      // NOTE: expo-image-picker only base64-encodes images, not videos, so videos need to be read from disk
      processed = {
        ...image,
        base64: await fileSystemService.convertToBase64(image.uri),
      };
    }

    if (!isImageUploadEnabled) {
      attachedImages.set((prev) => [...prev, processed]);

      return;
    }

    // NOTE: Uploaded right away, as the web app does, so a failure surfaces while the image is still
    // in the composer rather than after the message is gone.
    attachedImages.set((prev) => [...prev, { ...processed, isUploading: true }]);

    try {
      const file = await uploadImage(processed);

      attachedImages.set((prev) =>
        prev.map((attached) =>
          attached.uri === processed.uri
            ? {
                ...attached,
                fileId: file.id,
                contentType: file.meta?.contentType ?? processed.mimeType,
                isUploading: false,
              }
            : attached,
        ),
      );
    } catch (error) {
      // NOTE: The api-client interceptor toasts every server error but stays silent on network
      // failures, so only those need a toast here. Like the web app, the image is then dropped so
      // the user can attach it again.
      if (isAxiosError(error) && !error.response) {
        ToastService.showError();
      }

      handleDeleteImage(processed.uri);
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
