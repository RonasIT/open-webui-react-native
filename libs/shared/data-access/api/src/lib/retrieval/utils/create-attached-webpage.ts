import { AttachedWebpage, FileType } from '@open-webui-react-native/shared/data-access/common';
import { ProcessUrlResponse } from '../models';

export function createAttachedWebpage(response: ProcessUrlResponse): AttachedWebpage {
  const name = response.name || response.url;

  return new AttachedWebpage({
    type: FileType.TEXT,
    name,
    collectionName: response.collectionName,
    status: 'uploaded',
    context: 'full',
    url: response.url,
    file: {
      data: {
        content: response.content ?? '',
      },
      meta: {
        name,
        source: response.url,
      },
    },
  });
}
