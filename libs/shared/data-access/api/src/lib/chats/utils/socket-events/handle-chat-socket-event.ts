import { plainToInstance } from 'class-transformer';
import { ChatEventBase, ChatEventType } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
import { handleChatCompletionEvent } from './handle-chat-completion-event';
import { handleChatFilesEvent } from './handle-chat-files-event';
import { handleChatStatusEvent } from './handle-chat-status-event';
import { handleChatTitleEvent } from './handle-chat-title-event';

export const handleChatSocketEvent = (socketResponse: ChatEventBase): void => {
  const response = plainToInstance(ChatEventBase, socketResponse);

  switch (socketResponse.data.type) {
    case ChatEventType.COMPLETION:
      handleChatCompletionEvent(response);
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
  }
};
