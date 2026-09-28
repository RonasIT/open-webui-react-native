import { AttachedImage, FileType, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { toDataUrl } from '@open-webui-react-native/shared/utils/files';

// NOTE: Two cases:
// - `fileId` is set: the image was uploaded and is sent in the web app's shape,
//   `{ id, type: 'image', url: <file id>, content_type }`;
// - no `fileId` (temporary chat, voice mode, no `chat.file_upload` permission): the image is sent
//   inline as a `data:` URL, as before.
export function prepareAttachedImages(attachedImages: Array<ImageData>): Array<AttachedImage> {
  return attachedImages.map((image) =>
    image.fileId
      ? new AttachedImage({ id: image.fileId, type: FileType.IMAGE, url: image.fileId, contentType: image.contentType })
      : new AttachedImage({ url: toDataUrl(image.base64!, image.mimeType), type: FileType.IMAGE }),
  );
}
