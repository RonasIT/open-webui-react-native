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

  const attachedFiles = (attachedItems ?? []).flatMap((item) => (item.kind === FileType.FILE ? [item.file] : []));
  const attachedCollections = (attachedItems ?? []).flatMap((item) =>
    item.kind === FileType.COLLECTION ? [item.collection] : [],
  );
  // NOTE: an errored webpage is a client-only chip (see attach-webpage-sheet) — it never had a
  // successful process-url response behind it, so it must not be sent as a message attachment.
  const attachedWebpages = (attachedItems ?? []).flatMap((item) =>
    item.kind === FileType.TEXT && item.webpage.status !== AttachmentStatus.ERROR ? [item.webpage] : [],
  );

  const files = [
    ...prepareAttachedFiles(attachedFiles),
    ...(attachedImages ? prepareAttachedImages(attachedImages) : []),
    ...attachedCollections,
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
