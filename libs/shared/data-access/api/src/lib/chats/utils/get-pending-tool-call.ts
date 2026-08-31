import { ChatCompletionOutputItem } from '@open-webui-react-native/shared/data-access/websocket';
import { ToolCallStatus } from '../enums';
import { Message } from '../models';

const FUNCTION_CALL_TYPE = 'function_call';
const FUNCTION_CALL_OUTPUT_TYPE = 'function_call_output';
const ASK_USER_TOOL_NAME = 'ask_user';

const PENDING_TOOL_CALL_STATUSES = new Set<string>([ToolCallStatus.PENDING, ToolCallStatus.REQUIRES_APPROVAL]);

export interface PendingToolCall {
  callId: string;
  toolName: string;
  // The built-in `ask_user` call pauses the turn the same way, but it expects the user's answers
  // rather than an approval — the backend rejects `approve` for it with 400.
  isAskUser: boolean;
  toolArguments?: string;
}

const getFunctionCallId = (item: ChatCompletionOutputItem): string | undefined => item.callId ?? item.id;

// NOTE: A paused turn is not announced by a dedicated socket event — the backend just sends the
// message `output` with one `function_call` left unanswered and stops streaming. So the pause is
// derived here: a pending call that has no `function_call_output` carrying the same `call_id`.
export const getPendingToolCall = (message?: Message): PendingToolCall | undefined => {
  const output = message?.output;

  if (!Array.isArray(output)) {
    return undefined;
  }

  const resolvedCallIds = new Set(
    output.flatMap((item) => (item.type === FUNCTION_CALL_OUTPUT_TYPE && item.callId ? [item.callId] : [])),
  );

  const pendingCall = output.find((item) => {
    const callId = getFunctionCallId(item);

    return (
      item.type === FUNCTION_CALL_TYPE &&
      callId != null &&
      PENDING_TOOL_CALL_STATUSES.has(item.status ?? '') &&
      !resolvedCallIds.has(callId)
    );
  });

  if (!pendingCall) {
    return undefined;
  }

  const callId = getFunctionCallId(pendingCall);

  if (!callId) {
    return undefined;
  }

  const toolName = pendingCall.name ?? '';

  return {
    callId,
    toolName,
    isAskUser: toolName === ASK_USER_TOOL_NAME,
    toolArguments: pendingCall.toolArguments,
  };
};
