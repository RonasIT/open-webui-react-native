import { uniqBy } from 'lodash-es';
import {
  AttachedChat,
  AttachedFile,
  AttachedKnowledgeCollection,
  FileType,
} from '@open-webui-react-native/shared/data-access/common';
import { Message } from '../models';

export type CompletionFile = AttachedFile | AttachedKnowledgeCollection | AttachedChat;

export function getCompletionFiles(messages: Array<Message>): Array<CompletionFile> {
  return uniqBy(
    messages
      .flatMap((message) => message.files ?? [])
      .filter(
        (file): file is CompletionFile =>
          file.type === FileType.FILE || file.type === FileType.COLLECTION || file.type === FileType.CHAT,
      ),
    'id',
  );
}
