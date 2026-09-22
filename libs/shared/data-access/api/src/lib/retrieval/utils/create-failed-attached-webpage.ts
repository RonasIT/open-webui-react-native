import { AttachedWebpage, AttachmentStatus, FileType } from '@open-webui-react-native/shared/data-access/common';

export function createFailedAttachedWebpage(url: string): AttachedWebpage {
  return new AttachedWebpage({
    type: FileType.TEXT,
    name: url,
    status: AttachmentStatus.ERROR,
    url,
  });
}
