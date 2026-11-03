import { getPendingToolCall, getToolCalls, Message } from '@open-webui-react-native/shared/data-access/api';
import { ChatCompletionOutputItemType } from '@open-webui-react-native/shared/data-access/websocket';

// NOTE: A message waiting for tool approval, running a tool, thinking, or failed before any text shows
// its card, not a skeleton.
export const isSkeletonMessage = (message: Message): boolean =>
  !message.content &&
  !getPendingToolCall(message) &&
  !getToolCalls(message).length &&
  !message.output?.some((item) => item.type === ChatCompletionOutputItemType.REASONING) &&
  !message.error?.content;
