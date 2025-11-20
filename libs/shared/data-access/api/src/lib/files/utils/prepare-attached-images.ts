import { AttachedImage, FileType, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { toDataUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/files';

export function prepareAttachedImages(attachedImages: Array<ImageData>): Array<AttachedImage> {
  return attachedImages.map(
    (image) => new AttachedImage({ url: toDataUrl(image.base64!, image.mimeType), type: FileType.IMAGE }),
  );
}
