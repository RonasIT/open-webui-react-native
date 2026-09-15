import { AttachedKnowledgeCollection } from './attached-knowledge-collection';
import { FileData } from './file-data';

// NOTE: a single message can attach a mix of freshly-uploaded files, files picked from a
// knowledge base, and whole knowledge-base collections — this discriminated union is the one
// list all three live in, client-side, before being split apart into the outgoing wire shape.
export type AttachedListItem =
  | { kind: 'file'; file: FileData; isFromKnowledge: boolean }
  | { kind: 'collection'; collection: AttachedKnowledgeCollection };

export function getAttachedListItemId(item: AttachedListItem): string {
  return item.kind === 'file' ? item.file.id : item.collection.id;
}
