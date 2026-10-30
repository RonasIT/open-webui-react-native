import { getToolCalls, Message } from '@open-webui-react-native/shared/data-access/api';
import {
  ChatCompletionOutputContentPart,
  ChatCompletionOutputItem,
  ChatCompletionOutputItemStatus,
  ChatCompletionOutputItemType,
} from '@open-webui-react-native/shared/data-access/websocket';
import { buildToolCallViews, ToolCallView } from './build-tool-call-views';
import { DetailsBlock, ReasoningData } from './parse-response-message-content';

const FINISHED_STATUSES = new Set<string>(Object.values(ChatCompletionOutputItemStatus));

export interface ReasoningView extends ReasoningData {
  key: string;
}

export type MessageRow = { type: 'reasoning'; reasoning: ReasoningView } | { type: 'tool'; toolCall: ToolCallView };

const getPartsText = (parts?: Array<ChatCompletionOutputContentPart> | null): string =>
  (parts ?? []).map((part) => part.text ?? '').join('');

// NOTE: As in the web client: anything after the item means the model moved on, since a stopped turn
// leaves it unclosed.
const buildReasoningView = (
  item: ChatCompletionOutputItem,
  index: number,
  output: Array<ChatCompletionOutputItem>,
  isMessageDone: boolean,
): ReasoningView => ({
  key: item.id ?? `reasoning-${index}`,
  isDone:
    isMessageDone || FINISHED_STATUSES.has(item.status ?? '') || item.duration != null || index < output.length - 1,
  duration: item.duration ?? undefined,
  text: getPartsText(item.summary?.length ? item.summary : item.content).trim(),
});

// NOTE: Rows come from `output` (Open WebUI 0.11.0+); `<details>` blocks in the text are the fallback for older chats.
export const buildMessageRows = (
  message: Message,
  detailsBlocks: Array<DetailsBlock>,
  isMessageDone: boolean,
): Array<MessageRow> => {
  const output = message.output ?? [];
  const legacyTools = detailsBlocks.flatMap((block) => (block.type === 'tool_calls' ? [block.tool] : []));
  const toolCallViews = buildToolCallViews(message, legacyTools);
  const toolCallViewsByKey = new Map(toolCallViews.map((view) => [view.key, view]));
  const hasOutputReasoning = output.some((item) => item.type === ChatCompletionOutputItemType.REASONING);
  const hasOutputToolCalls = getToolCalls(message).length > 0;
  const rows: Array<MessageRow> = [];

  output.forEach((item, index) => {
    const toolCall = hasOutputToolCalls && toolCallViewsByKey.get(item.callId ?? item.id ?? '');

    if (item.type === ChatCompletionOutputItemType.REASONING) {
      rows.push({ type: 'reasoning', reasoning: buildReasoningView(item, index, output, isMessageDone) });
    } else if (item.type === ChatCompletionOutputItemType.FUNCTION_CALL && toolCall) {
      rows.push({ type: 'tool', toolCall });
    }
  });

  let legacyToolIndex = 0;

  detailsBlocks.forEach((block, index) => {
    if (block.type === 'reasoning' && !hasOutputReasoning) {
      const { isDone, ...reasoning } = block.reasoning;
      rows.push({
        type: 'reasoning',
        reasoning: { ...reasoning, key: `legacy-reasoning-${index}`, isDone: isDone || isMessageDone },
      });
    }

    if (block.type === 'tool_calls' && !hasOutputToolCalls) {
      rows.push({ type: 'tool', toolCall: toolCallViews[legacyToolIndex++] });
    }
  });

  return rows;
};
