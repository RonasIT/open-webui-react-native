import { FileType } from '../../enums';
import { AttachedKnowledgeCollection } from './attached-knowledge-collection';
import { FileData } from './file-data';

// NOTE: a single message can attach a mix of freshly-uploaded files, files picked from a
// knowledge base, and whole knowledge-base collections — this discriminated union is the one
// list all three live in, client-side, before being split apart into the outgoing wire shape.
export type AttachedListItem =
  | { kind: FileType.FILE; file: FileData; isFromKnowledge: boolean }
  | { kind: FileType.COLLECTION; collection: AttachedKnowledgeCollection };

export function getAttachedListItemId(item: AttachedListItem): string {
  return item.kind === FileType.FILE ? item.file.id : item.collection.id;
}
