import { File } from 'expo-file-system';
import { compressImage } from '@open-webui-react-native/mobile/shared/utils/compressor';
import { PickedImageData } from '@open-webui-react-native/shared/data-access/common';

// NOTE: Pasted media arrives as original files (PNG screenshots, HEIC photos), so static images are
// re-encoded the way the gallery picker does it: JPEG at quality 0.2, full resolution. The large
// bounds switch off react-native-compressor's default 1280px downscale.
const PASTED_IMAGE_COMPRESSION = {
  compressionMethod: 'auto',
  output: 'jpg',
  quality: 0.2,
  maxWidth: 100_000,
  maxHeight: 100_000,
} as const;

export const preparePastedImage = async (uri: string): Promise<PickedImageData> => {
  // NOTE: GIFs (including keyboard stickers) are passed as they are, so they keep their animation.
  const isGif = new File(uri).type === 'image/gif';
  // NOTE: The compressor may return the original file when re-encoding would make it larger, so the
  // MIME type is read from the returned file. The OS reports an empty type for an unreadable file.
  const preparedUri = isGif ? uri : await compressImage(uri, PASTED_IMAGE_COMPRESSION);

  return { uri: preparedUri, mimeType: new File(preparedUri).type || undefined };
};
