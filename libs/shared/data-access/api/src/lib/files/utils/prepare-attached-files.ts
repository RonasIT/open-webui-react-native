import uuid from 'react-native-uuid';
import { AttachedFile, FileData, FileType } from '@open-webui-react-native/shared/data-access/common';
import { filesApiConfig } from '../config';

export function prepareAttachedFiles(attachedFiles?: Array<FileData>): Array<AttachedFile> {
  return (
    attachedFiles?.map((file) => {
      const tempItemId = uuid.v4();

      return new AttachedFile({
        type: FileType.FILE,
        name: file.meta.name,
        size: file.meta.size,
        status: 'uploaded',
        file: file,
        error: '',
        id: file.id,
        itemId: tempItemId,
        collectionName: file.meta.collectionName || file.collectionName,
        url: `${filesApiConfig.filesStorageRoute}${file.id}`,
      });
    }) ?? []
  );
}
