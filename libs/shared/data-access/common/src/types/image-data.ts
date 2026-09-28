export type ImageData = {
  uri: string;
  base64: string;
  mimeType?: string;
  fileName?: string;
  // NOTE: Set once the image is uploaded to the server — absent while it is uploading, and for
  // images kept inline (temporary chats, voice mode, support requests).
  fileId?: string;
  contentType?: string;
  isUploading?: boolean;
};
