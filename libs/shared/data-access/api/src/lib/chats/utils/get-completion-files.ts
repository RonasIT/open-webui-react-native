import { uniqBy } from 'lodash-es';
import {
  AttachedFile,
  AttachedKnowledgeCollection,
  FileType,
} from '@open-webui-react-native/shared/data-access/common';
import { Message } from '../models';

export type CompletionFile = AttachedFile | AttachedKnowledgeCollection;

export function getCompletionFiles(messages: Array<Message>): Array<CompletionFile> {
  return uniqBy(
    messages
      .flatMap((message) => message.files ?? [])
      .filter((file): file is CompletionFile => file.type === FileType.FILE || file.type === FileType.COLLECTION),
    'id',
  );
}
