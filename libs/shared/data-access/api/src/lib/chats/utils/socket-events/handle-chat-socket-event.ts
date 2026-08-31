import { plainToInstance } from 'class-transformer';
import { ChatEventBase, ChatEventType } from '@open-webui-react-native/shared/data-access/websocket';
import { handleChatCompletionEvent } from './handle-chat-completion-event';
import { handleChatFilesEvent } from './handle-chat-files-event';
import { handleChatMessageErrorEvent } from './handle-chat-message-error-event';
import { handleChatMessageFollowUpsEvent } from './handle-chat-message-follow-ups-event';
import { handleChatStatusEvent } from './handle-chat-status-event';
import { handleChatTitleEvent } from './handle-chat-title-event';
import { handleResponseCompletionEvent } from './handle-response-completion-event';

export const handleChatSocketEvent = (socketResponse: ChatEventBase): void => {
  const response = plainToInstance(ChatEventBase, socketResponse);

  switch (socketResponse.data.type) {
    case ChatEventType.COMPLETION:
      handleChatCompletionEvent(response);
      break;
    case ChatEventType.RESPONSE_COMPLETION:
      handleResponseCompletionEvent(response);
      break;
    case ChatEventType.MESSAGE_ERROR:
      handleChatMessageErrorEvent(response);
      break;
    case ChatEventType.TITLE:
      handleChatTitleEvent(response);
      break;
    case ChatEventType.STATUS:
      handleChatStatusEvent(response);
      break;
    case ChatEventType.FILES:
      handleChatFilesEvent(response);
      break;
    case ChatEventType.MESSAGE_FOLLOW_UPS:
      handleChatMessageFollowUpsEvent(response);
      break;
  }
};
