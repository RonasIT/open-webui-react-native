import { AttachedImage, FileType, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { toDataUrl } from '@open-webui-react-native/shared/utils/files';

// NOTE: The backend lists a message image to the model as a file it can hand to tools (e.g.
// `edit_image`) only when the image is a server file — an inline `data:` URL is shown to the model
// but skipped in that list, so the model sees the photo yet cannot edit it. An uploaded image uses
// the web app's shape: `url` is the bare file id, which the backend resolves for vision and for
// tools, and which the web renders once `content_type` is present.
export function prepareAttachedImages(attachedImages: Array<ImageData>): Array<AttachedImage> {
  return attachedImages.map((image) =>
    image.fileId
      ? new AttachedImage({ id: image.fileId, type: FileType.IMAGE, url: image.fileId, contentType: image.contentType })
      : new AttachedImage({ url: toDataUrl(image.base64!, image.mimeType), type: FileType.IMAGE }),
  );
}
