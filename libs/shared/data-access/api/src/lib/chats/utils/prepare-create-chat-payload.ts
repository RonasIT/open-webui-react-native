import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { FileData, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { Chat, CreateNewChatRequest } from '../models';
import { buildMessagesHistory } from './build-messages-history';
import { createMessagePair } from './create-message-pair';

export interface PrepareCreateChatPayloadArgs {
  prompt: string;
  model: string;
  attachedFiles?: Array<FileData>;
  attachedImages?: Array<ImageData>;
  folderId?: string;
}

export function prepareCreateChatPayload({
  prompt,
  model,
  attachedFiles,
  attachedImages,
  folderId,
}: PrepareCreateChatPayloadArgs): CreateNewChatRequest {
  const { userMessage, assistantMessage, assistantMessageId, timestampMs } = createMessagePair({
    prompt,
    model,
    attachedFiles,
    attachedImages,
  });

  const history = buildMessagesHistory({}, userMessage, assistantMessage, assistantMessageId);

  return new CreateNewChatRequest({
    chat: new Chat({
      history,
      messages: [userMessage, assistantMessage],
      timestamp: timestampMs,
      title: i18n.t('SHARED.COMMON.TEXT_NEW_CHAT'),
      id: '',
      params: {},
      tags: [],
      models: [model],
    }),
    folderId,
  });
}
