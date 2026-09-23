import { FileType } from '../../enums';
import { AttachedChat } from './attached-chat';
import { AttachedKnowledgeCollection } from './attached-knowledge-collection';
import { AttachedWebpage } from './attached-webpage';
import { FileData } from './file-data';

// NOTE: a single message can attach a mix of freshly-uploaded files, files picked from a
// knowledge base, whole knowledge-base collections, scraped webpages, and references to other
// chats — this discriminated union is the one list they all live in, client-side, before being
// split apart into the outgoing wire shape.
export type AttachedListItem =
  | { kind: FileType.FILE; file: FileData; isFromKnowledge?: boolean }
  | { kind: FileType.COLLECTION; collection: AttachedKnowledgeCollection }
  | { kind: FileType.TEXT; webpage: AttachedWebpage }
  | { kind: FileType.CHAT; chat: AttachedChat };

export function getAttachedListItemId(item: AttachedListItem): string {
  switch (item.kind) {
    case FileType.FILE:
      return item.file.id;
    case FileType.COLLECTION:
      return item.collection.id;
    case FileType.TEXT:
      return item.webpage.url;
    case FileType.CHAT:
      return item.chat.id;
  }
}
