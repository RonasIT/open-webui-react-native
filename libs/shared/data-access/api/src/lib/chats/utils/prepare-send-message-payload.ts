import { EntityPartial } from '@ronas-it/rtkq-entity-api';
import { FileData, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { Chat, ChatResponse } from '../models';
import { buildMessagesHistory } from './build-messages-history';
import { createMessagePair } from './create-message-pair';
import { createMessagesList } from './create-messages-list';

export interface PrepareSendMessagePayloadArgs {
  prompt: string;
  chatData: ChatResponse;
  model: string;
  attachedFiles?: Array<FileData>;
  attachedImages?: Array<ImageData>;
}

export function prepareSendMessagePayload({
  prompt,
  chatData,
  model,
  attachedFiles,
  attachedImages,
}: PrepareSendMessagePayloadArgs): EntityPartial<ChatResponse> {
  const { userMessage, assistantMessage, assistantMessageId } = createMessagePair({
    prompt,
    model,
    currentMessageId: chatData.chat.history.currentId,
    attachedFiles,
    attachedImages,
  });

  const updatedMessages = {
    ...chatData.chat.history.messages,
    [chatData.chat.history.currentId]: {
      ...chatData.chat.history.messages[chatData.chat.history.currentId],
      childrenIds: [userMessage.id],
    },
  };

  const history = buildMessagesHistory(updatedMessages, userMessage, assistantMessage, assistantMessageId);

  return {
    id: chatData.id,
    chat: new Chat({
      history,
      messages: createMessagesList(history, assistantMessageId),
      models: [model],
    }),
  };
}
