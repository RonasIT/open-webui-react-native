import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AttachedListItem, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { Chat, CreateNewChatRequest } from '../models';
import { buildMessagesHistory } from './build-messages-history';
import { createMessagePair } from './create-message-pair';

export interface PrepareCreateChatPayloadArgs {
  prompt: string;
  model: string;
  attachedItems?: Array<AttachedListItem>;
  attachedImages?: Array<ImageData>;
  folderId?: string;
  systemPrompt?: string;
}

export function prepareCreateChatPayload({
  prompt,
  model,
  attachedItems,
  attachedImages,
  folderId,
  systemPrompt,
}: PrepareCreateChatPayloadArgs): CreateNewChatRequest {
  const { userMessage, assistantMessage, assistantMessageId, timestampMs } = createMessagePair({
    prompt,
    model,
    attachedItems,
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
      params: systemPrompt ? { system: systemPrompt } : {},
      tags: [],
      models: [model],
    }),
    folderId,
  });
}
