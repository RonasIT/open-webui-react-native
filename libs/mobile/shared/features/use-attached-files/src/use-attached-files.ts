import { useObservable } from '@legendapp/state/react';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { ImageMimeType } from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { compressImage } from '@open-webui-react-native/mobile/shared/utils/compressor';
import {
  AttachedChat,
  AttachedKnowledgeCollection,
  AttachedListItem,
  FileData,
  FileType,
  getAttachedListItemId,
  ImageData,
} from '@open-webui-react-native/shared/data-access/common';

export function useAttachedFiles(): typeof result {
  const attachedItems = useObservable<Array<AttachedListItem>>([]);
  const attachedImages = useObservable<Array<ImageData>>([]);

  const pushItem = (item: AttachedListItem): void => {
    attachedItems.set((prev) =>
      prev.some((attached) => getAttachedListItemId(attached) === getAttachedListItemId(item)) ? prev : [...prev, item],
    );
  };

  const handleFileUploaded = (file: FileData): void => {
    pushItem({ kind: FileType.FILE, file, isFromKnowledge: false });
  };

  const handleKnowledgeFileAttached = (file: FileData): void => {
    pushItem({ kind: FileType.FILE, file, isFromKnowledge: true });
  };

  const handleKnowledgeCollectionAttached = (collection: AttachedKnowledgeCollection): void => {
    pushItem({ kind: FileType.COLLECTION, collection });
  };

  const handleChatAttached = (chat: AttachedChat): void => {
    pushItem({ kind: FileType.CHAT, chat });
  };

  const handleDeleteItem = (id: string): void => {
    attachedItems.set((prev) => prev.filter((item) => getAttachedListItemId(item) !== id));
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

    attachedImages.set((prev) => [...prev, processed]);
  };

  const handleDeleteImage = (uri: string): void => {
    attachedImages.set((prev) => prev.filter((image) => image.uri !== uri));
  };

  const resetAttachments = (): void => {
    attachedItems.set([]);
    attachedImages.set([]);
  };

  const result = {
    attachedItems,
    handleFileUploaded,
    handleKnowledgeFileAttached,
    handleKnowledgeCollectionAttached,
    handleChatAttached,
    handleDeleteItem,
    attachedImages,
    handleImageUploaded,
    handleDeleteImage,
    resetAttachments,
  };

  return result;
}
