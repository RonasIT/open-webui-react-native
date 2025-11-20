import dayjs from 'dayjs';
import uuid from 'react-native-uuid';
import { FileData, ImageData, Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { prepareAttachedFiles, prepareAttachedImages } from '../../files';
import { Message } from '../models';

export interface CreateMessagePairArgs {
  prompt: string;
  model: string;
  currentMessageId?: string;
  attachedFiles?: Array<FileData>;
  attachedImages?: Array<ImageData>;
}

export function createMessagePair({
  prompt,
  model,
  currentMessageId,
  attachedFiles,
  attachedImages,
}: CreateMessagePairArgs): typeof result {
  const userMessageId = uuid.v4();
  const assistantMessageId = uuid.v4();
  const now = dayjs();
  const timestampSec = Math.floor(now.unix());
  const timestampMs = now.valueOf();

  const files = [
    ...(attachedFiles ? prepareAttachedFiles(attachedFiles) : []),
    ...(attachedImages ? prepareAttachedImages(attachedImages) : []),
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
