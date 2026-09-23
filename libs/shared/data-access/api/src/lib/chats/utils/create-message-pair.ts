import dayjs from 'dayjs';
import uuid from 'react-native-uuid';
import {
  AttachedListItem,
  AttachmentStatus,
  FileType,
  ImageData,
  Role,
} from '@open-webui-react-native/shared/data-access/common';
import { prepareAttachedFiles, prepareAttachedImages } from '../../files';
import { Message } from '../models';

export interface CreateMessagePairArgs {
  prompt: string;
  model: string;
  currentMessageId?: string;
  attachedItems?: Array<AttachedListItem>;
  attachedImages?: Array<ImageData>;
}

// NOTE: AttachedListItem is a discriminated union keyed by `kind`, but each variant nests its
// payload under a differently named field (file/collection/webpage/chat) — `pluck` is how the
// caller tells us which one to read once `kind` has narrowed the item.
function pickAttached<K extends AttachedListItem['kind'], V>(
  items: Array<AttachedListItem>,
  kind: K,
  pluck: (item: Extract<AttachedListItem, { kind: K }>) => V,
): Array<V> {
  return items.flatMap((item) => (item.kind === kind ? [pluck(item as Extract<AttachedListItem, { kind: K }>)] : []));
}

export function createMessagePair({
  prompt,
  model,
  currentMessageId,
  attachedItems,
  attachedImages,
}: CreateMessagePairArgs): typeof result {
  const userMessageId = uuid.v4();
  const assistantMessageId = uuid.v4();
  const now = dayjs();
  const timestampSec = Math.floor(now.unix());
  const timestampMs = now.valueOf();

  const items = attachedItems ?? [];
  const attachedFiles = pickAttached(items, FileType.FILE, (item) => item.file);
  const attachedCollections = pickAttached(items, FileType.COLLECTION, (item) => item.collection);
  const attachedChats = pickAttached(items, FileType.CHAT, (item) => item.chat);
  // NOTE: an errored webpage is a client-only chip (see attach-webpage-sheet) — it never had a
  // successful process-url response behind it, so it must not be sent as a message attachment.
  const attachedWebpages = pickAttached(items, FileType.TEXT, (item) => item.webpage).filter(
    (webpage) => webpage.status !== AttachmentStatus.ERROR,
  );

  const files = [
    ...prepareAttachedFiles(attachedFiles),
    ...(attachedImages ? prepareAttachedImages(attachedImages) : []),
    ...attachedCollections,
    ...attachedChats,
    ...attachedWebpages,
  ];

  const userMessage = new Message({
    id: userMessageId,
    content: prompt,
    timestamp: timestampSec,
    childrenIds: [assistantMessageId],
    role: Role.USER,
    files: files,
    models: [model],
    parentId: currentMessageId || null,
  });

  const assistantMessage = new Message({
    id: assistantMessageId,
    timestamp: timestampSec,
    parentId: userMessageId,
    role: Role.ASSISTANT,
    content: '',
    model,
    modelName: model,
    childrenIds: [],
  });

  const result = {
    userMessage,
    assistantMessage,
    assistantMessageId,
    timestampMs,
  };

  return result;
}
