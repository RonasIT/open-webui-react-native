import { getPendingToolCall, getToolCalls, Message } from '@open-webui-react-native/shared/data-access/api';

// NOTE: A message waiting for tool approval, running a tool, or failed before any text shows its card,
// not a skeleton.
export const isSkeletonMessage = (message: Message): boolean =>
  !message.content && !getPendingToolCall(message) && !getToolCalls(message).length && !message.error?.content;
