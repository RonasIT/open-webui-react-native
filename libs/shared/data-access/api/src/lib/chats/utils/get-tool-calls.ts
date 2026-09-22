import {
  ChatCompletionOutputFile,
  ChatCompletionOutputItem,
  ChatCompletionOutputItemType,
  ChatCompletionOutputPartType,
} from '@open-webui-react-native/shared/data-access/websocket';
import { BuiltInToolName, ToolCallState, ToolCallStatus } from '../enums';
import { Message } from '../models';

const AWAITING_USER_STATUSES = new Set<string>([ToolCallStatus.PENDING, ToolCallStatus.REQUIRES_APPROVAL]);
const FAILED_STATUSES = new Set<string>([ToolCallStatus.FAILED, ToolCallStatus.INCOMPLETE]);

export interface ToolCall {
  callId: string;
  toolName: string;
  state: ToolCallState;
  toolArguments?: string;
  // The tool's own answer, as the backend stored it — raw, so the UI decides how to present it.
  output?: string;
  // Images and audio the tool produced for the user; empty for calls that produced none.
  files: Array<ChatCompletionOutputFile>;
}

const getCallId = (item: ChatCompletionOutputItem): string | undefined => item.callId ?? item.id;

const getResultText = (resultItem?: ChatCompletionOutputItem): string | undefined => {
  const text = (resultItem?.output ?? [])
    .filter((part) => part.type !== ChatCompletionOutputPartType.INPUT_IMAGE)
    .map((part) => part.text ?? '')
    .join('');

  return text || undefined;
};

const getState = (callItem: ChatCompletionOutputItem, resultItem?: ChatCompletionOutputItem): ToolCallState => {
  const status = callItem.status ?? '';

  if (status === ToolCallStatus.REJECTED) {
    return ToolCallState.REJECTED;
  }

  if (FAILED_STATUSES.has(status) || FAILED_STATUSES.has(resultItem?.status ?? '')) {
    return ToolCallState.FAILED;
  }

  if (resultItem) {
    return ToolCallState.COMPLETED;
  }

  // `completed` without a result means arguments are final and the tool is in flight. `queued`
  // is the next call waiting on an earlier approval — not running yet.
  return status === ToolCallStatus.COMPLETED ? ToolCallState.EXECUTING : ToolCallState.PREPARING;
};

// NOTE: The tool calls of an assistant message, in the order the backend returned them, each
// paired with its result by `call_id`. Calls still waiting for the user are left out — those are
// the approval card's job (see `getPendingToolCall`), as is the built-in `ask_user`.
export const getToolCalls = (message?: Message): Array<ToolCall> => {
  const output = message?.output;

  if (!Array.isArray(output)) {
    return [];
  }

  const resultsByCallId = new Map<string, ChatCompletionOutputItem>(
    output.flatMap((item) =>
      item.type === ChatCompletionOutputItemType.FUNCTION_CALL_OUTPUT && item.callId
        ? [[item.callId, item] as const]
        : [],
    ),
  );

  return output.flatMap((item) => {
    const callId = getCallId(item);

    if (item.type !== ChatCompletionOutputItemType.FUNCTION_CALL || !callId || item.name === BuiltInToolName.ASK_USER) {
      return [];
    }

    const resultItem = resultsByCallId.get(callId);

    if (!resultItem && AWAITING_USER_STATUSES.has(item.status ?? '')) {
      return [];
    }

    return [
      {
        callId,
        toolName: item.name ?? '',
        state: getState(item, resultItem),
        toolArguments: item.toolArguments,
        output: getResultText(resultItem),
        files: resultItem?.files ?? [],
      },
    ];
  });
};
