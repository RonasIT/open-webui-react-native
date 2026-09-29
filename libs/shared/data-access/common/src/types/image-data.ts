import type { AttachmentStatus } from '../enums';

export type ImageData = {
  uri: string;
  base64: string;
  mimeType?: string;
  fileName?: string;
  // NOTE: Set once the image is uploaded to the server — absent while it is uploading, and for
  // images kept inline (temporary chats, voice mode, support requests).
  fileId?: string;
  contentType?: string;
  // NOTE: Absent for images kept inline, which are never uploaded.
  status?: AttachmentStatus.UPLOADING | AttachmentStatus.UPLOADED | AttachmentStatus.ERROR;
};

// NOTE: An image as a picker hands it over — `base64` is filled in by useAttachedFiles when missing.
export type PickedImageData = Omit<ImageData, 'base64'> & { base64?: string };
