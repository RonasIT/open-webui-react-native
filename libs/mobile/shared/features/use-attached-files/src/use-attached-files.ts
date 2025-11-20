import { useObservable } from '@legendapp/state/react';
import { fileSystemService } from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/file-system-service';
import { ImageMimeType } from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/image-picker-service';
import { compressImage } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/compressor';
import { FileData, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

export function useAttachedFiles(): typeof result {
  const attachedFiles = useObservable<Array<FileData>>([]);
  const attachedImages = useObservable<Array<ImageData>>([]);

  const handleFileUploaded = (file: FileData): void => {
    attachedFiles.set((prev) => [...prev, file]);
  };

  const handleDeleteFile = (id: string): void => {
    attachedFiles.set((prev) => prev.filter((file) => file.id !== id));
  };

  const handleImageUploaded = async (image: ImageData): Promise<void> => {
    let processed = image;

    if (image.mimeType === ImageMimeType.HEIC) {
      const compressed = await compressImage(image.uri, { output: 'jpg' });
      processed = {
        mimeType: ImageMimeType.JPEG,
        uri: compressed,
        base64: await fileSystemService.convertToBase64(compressed),
      };
    }

    attachedImages.set((prev) => [...prev, processed]);
  };

  const handleDeleteImage = (uri: string): void => {
    attachedImages.set((prev) => prev.filter((image) => image.uri !== uri));
  };

  const resetAttachments = (): void => {
    attachedFiles.set([]);
    attachedImages.set([]);
  };

  const result = {
    attachedFiles,
    handleFileUploaded,
    handleDeleteFile,
    attachedImages,
    handleImageUploaded,
    handleDeleteImage,
    resetAttachments,
  };

  return result;
}
