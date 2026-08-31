import { ToolCallStatus } from '../enums';
import { Message } from '../models';

const PENDING_STATUSES: Array<string> = [ToolCallStatus.PENDING, ToolCallStatus.REQUIRES_APPROVAL];
const ASK_USER_TOOL_NAME = 'ask_user';

export type PendingToolCall = {
  callId: string;
  toolName: string;
  // The built-in `ask_user` call pauses the turn the same way, but it expects the user's answers
  // rather than an approval — the backend rejects `approve` for it with 400.
  isAskUser: boolean;
  toolArguments?: string;
};

// NOTE: A paused turn is not announced by a dedicated socket event — the backend just sends the
// message `output` with one `function_call` left unanswered and stops streaming. So the pause is
// derived here: a pending call that has no `function_call_output` carrying the same `call_id`.
export function getPendingToolCall(message?: Message): PendingToolCall | undefined {
  const output = message?.output;

  if (!Array.isArray(output)) {
    return undefined;
  }

  const resolvedCallIds = new Set(
    output.flatMap((item) => (item.type === 'function_call_output' && item.callId ? [item.callId] : [])),
  );

  const pendingCall = output.find((item) => {
    const callId = item.callId ?? item.id;

    return (
      item.type === 'function_call' &&
      Boolean(callId) &&
      PENDING_STATUSES.includes(item.status ?? '') &&
      !resolvedCallIds.has(callId as string)
    );
  });

  if (!pendingCall) {
    return undefined;
  }

  return {
    callId: (pendingCall.callId ?? pendingCall.id) as string,
    toolName: pendingCall.name ?? '',
    isAskUser: pendingCall.name === ASK_USER_TOOL_NAME,
    toolArguments: pendingCall.toolArguments,
  };
}
