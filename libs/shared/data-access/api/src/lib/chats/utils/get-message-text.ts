import { getOutputText } from '@open-webui-react-native/shared/data-access/websocket';
import { Message } from '../models';

// NOTE: Open WebUI 0.10 streams a temporary chat as `output` snapshots and never sets the flat
// `content` string (middleware emits `{ done, output, title }`). The bubble still has to show that text.
export const getMessageText = (message: Pick<Message, 'content' | 'output'>): string => {
  if (typeof message.content === 'string' && message.content) {
    return message.content;
  }

  return getOutputText(message.output);
};
