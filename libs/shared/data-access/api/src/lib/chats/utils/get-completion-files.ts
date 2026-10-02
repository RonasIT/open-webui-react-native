import { uniqBy } from 'lodash-es';
import {
  AttachedChat,
  AttachedFile,
  AttachedKnowledgeCollection,
  AttachedWebpage,
  FileType,
} from '@open-webui-react-native/shared/data-access/common';
import { Message } from '../models';

export type CompletionFile = AttachedFile | AttachedKnowledgeCollection | AttachedWebpage | AttachedChat;

export function getCompletionFiles(messages: Array<Message>): Array<CompletionFile> {
  return uniqBy(
    messages
      .flatMap((message) => message.files ?? [])
      .filter(
        (file): file is CompletionFile =>
          file.type === FileType.FILE ||
          file.type === FileType.COLLECTION ||
          file.type === FileType.TEXT ||
          file.type === FileType.CHAT,
      ),
    (file) => (file.type === FileType.TEXT ? file.url : file.id),
  );
}
