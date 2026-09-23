import { FileType } from '../../enums';
import { AttachedChat } from './attached-chat';
import { AttachedKnowledgeCollection } from './attached-knowledge-collection';
import { FileData } from './file-data';

// NOTE: a single message can attach a mix of freshly-uploaded files, files picked from a
// knowledge base, whole knowledge-base collections, and references to other chats — this
// discriminated union is the one list they live in, client-side, before being split apart
// into the outgoing wire shape.
export type AttachedListItem =
  | { kind: FileType.FILE; file: FileData; isFromKnowledge: boolean }
  | { kind: FileType.COLLECTION; collection: AttachedKnowledgeCollection }
  | { kind: FileType.CHAT; chat: AttachedChat };

export function getAttachedListItemId(item: AttachedListItem): string {
  if (item.kind === FileType.FILE) {
    return item.file.id;
  }

  if (item.kind === FileType.COLLECTION) {
    return item.collection.id;
  }

  return item.chat.id;
}
