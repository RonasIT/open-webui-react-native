import { Role } from '@open-webui-react-native/shared/data-access/common';
import {
  ChatCompletionOutputContentPart,
  ChatCompletionOutputItem,
  ChatCompletionOutputItemType,
  ChatCompletionOutputPartType,
} from '@open-webui-react-native/shared/data-access/websocket';

const COMPLETED_STATUS = 'completed';

// NOTE: Open WebUI web renders only `output` when it is non-empty, so `content` alone isn't enough.
export const replaceOutputText = (
  output: Array<ChatCompletionOutputItem> | undefined,
  text: string,
): Array<ChatCompletionOutputItem> | undefined => {
  if (!output?.length) {
    return output;
  }

  const replacedItem = output.find((item) => item.type === ChatCompletionOutputItemType.MESSAGE);

  const messageItem = Object.assign(new ChatCompletionOutputItem(), {
    type: ChatCompletionOutputItemType.MESSAGE,
    id: replacedItem?.id,
    role: Role.ASSISTANT,
    status: COMPLETED_STATUS,
    content: [
      Object.assign(new ChatCompletionOutputContentPart(), { type: ChatCompletionOutputPartType.OUTPUT_TEXT, text }),
    ],
  });

  return [...output.filter((item) => item.type !== ChatCompletionOutputItemType.MESSAGE), messageItem];
};
