import { ChatCompletionOutputItemType } from '../enums/chat-completion-output-item-type';
import { ChatCompletionOutputPartType } from '../enums/chat-completion-output-part-type';
import { ChatCompletionOutputItem } from '../models/chat-event-data/chat-completion-chunk';
import { ChatCompletionOutputContentPart } from '../models/chat-event-data/chat-completion-output-content-part';
import { ResponseStreamEvent } from '../models/chat-event-data/response-stream-event';
import { getOutputText } from './get-output-text';

// NOTE: Answer deltas go into `message` items only, reasoning deltas into `reasoning` items only.
const ANSWER_DELTA_TYPES = ['output_text', 'text'];
const REASONING_DELTA_TYPE = 'reasoning_text';
const REASONING_SUMMARY_DELTA_TYPE = 'reasoning_summary_text';

// NOTE: Keyed by `output_index` rather than stored as a plain array because the stream is sparse:
// a delta can arrive for an item we never saw an `output_item.added` for. Items are replaced, never
// mutated: they end up in the query cache.
export type ResponseStreamState = Map<number, ChatCompletionOutputItem>;

const getLastIndex = (state: ResponseStreamState): number => (state.size ? Math.max(...state.keys()) : 0);

const findItemIndex = (state: ResponseStreamState, item: ChatCompletionOutputItem): number | undefined => {
  for (const [index, existing] of state) {
    // NOTE: A `function_call` and its `function_call_output` share the `call_id`, hence the type check.
    if (
      (item.id && existing.id === item.id) ||
      (item.callId && existing.type === item.type && existing.callId === item.callId)
    ) {
      return index;
    }
  }

  return undefined;
};

const appendToPart = (
  parts: Array<ChatCompletionOutputContentPart> | null | undefined,
  partIndex: number,
  partType: ChatCompletionOutputPartType,
  delta: string,
): Array<ChatCompletionOutputContentPart> => {
  const nextParts = [...(parts ?? [])];

  for (let index = nextParts.length; index <= partIndex; index++) {
    nextParts.push({ type: partType, text: '' });
  }

  nextParts[partIndex] = { ...nextParts[partIndex], text: `${nextParts[partIndex]?.text ?? ''}${delta}` };

  return nextParts;
};

const getDeltaItemType = (deltaType: string): ChatCompletionOutputItemType | undefined => {
  if (ANSWER_DELTA_TYPES.includes(deltaType)) {
    return ChatCompletionOutputItemType.MESSAGE;
  }

  if (deltaType === REASONING_DELTA_TYPE || deltaType === REASONING_SUMMARY_DELTA_TYPE) {
    return ChatCompletionOutputItemType.REASONING;
  }

  return undefined;
};

const applyDelta = (state: ResponseStreamState, event: ResponseStreamEvent, deltaType: string): boolean => {
  const itemType = getDeltaItemType(deltaType);

  if (!itemType || !event.delta) {
    return false;
  }

  const index = event.outputIndex ?? getLastIndex(state);
  // NOTE: `item_id` lets `response.completed` replace this item instead of duplicating it.
  const item = state.get(index) ?? new ChatCompletionOutputItem({ type: itemType, id: event.itemId });

  if (item.type !== itemType) {
    return false;
  }

  const update: Partial<ChatCompletionOutputItem> =
    deltaType === REASONING_SUMMARY_DELTA_TYPE
      ? {
          summary: appendToPart(
            item.summary,
            event.summaryIndex ?? 0,
            ChatCompletionOutputPartType.SUMMARY_TEXT,
            event.delta,
          ),
        }
      : {
          content: appendToPart(
            item.content,
            event.contentIndex ?? 0,
            itemType === ChatCompletionOutputItemType.REASONING
              ? ChatCompletionOutputPartType.REASONING_TEXT
              : ChatCompletionOutputPartType.OUTPUT_TEXT,
            event.delta,
          ),
        };

  state.set(index, new ChatCompletionOutputItem({ ...item, ...update }));

  return true;
};

export const createResponseStreamState = (): ResponseStreamState => new Map();

// NOTE: Seeds the accumulator from an authoritative full `output` snapshot. Open WebUI 0.11.1
// still sends such snapshots via `chat:completion` at tool-call boundaries, and subsequent deltas
// carry indices relative to that same array — so re-seeding by array position keeps them aligned.
export const seedResponseStreamState = (output?: Array<ChatCompletionOutputItem>): ResponseStreamState =>
  new Map(Array.isArray(output) ? output.map((item, index) => [index, item]) : []);

// NOTE: Mutates `state` in place and reports whether the output may have changed.
export const applyResponseStreamEvent = (state: ResponseStreamState, event: ResponseStreamEvent): boolean => {
  const eventType = event?.type ?? '';

  if (!eventType.startsWith('response.')) {
    return false;
  }

  if (eventType === 'response.completed') {
    const output = event.response?.output;

    if (!output?.length) {
      return false;
    }

    // NOTE: A completion covers only the last tool-call round, so it merges into the state.
    for (const item of output) {
      state.set(findItemIndex(state, item) ?? (state.size ? getLastIndex(state) + 1 : 0), item);
    }

    return true;
  }

  if (eventType === 'response.output_item.added' || eventType === 'response.output_item.done') {
    if (!event.item) {
      return false;
    }

    state.set(event.outputIndex ?? (state.size ? getLastIndex(state) + 1 : 0), event.item);

    return true;
  }

  if (!eventType.endsWith('.delta')) {
    return false;
  }

  return applyDelta(state, event, eventType.split('.')[1] ?? '');
};

export const getResponseStreamOutput = (state: ResponseStreamState): Array<ChatCompletionOutputItem> =>
  Array.from(state.entries())
    .sort(([a], [b]) => a - b)
    .map(([, item]) => item);

export const getResponseStreamText = (state: ResponseStreamState): string =>
  getOutputText(getResponseStreamOutput(state));
