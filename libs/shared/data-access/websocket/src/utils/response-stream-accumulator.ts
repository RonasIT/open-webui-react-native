import { ChatCompletionOutputItem } from '../models/chat-event-data/chat-completion-chunk';
import { ResponseStreamEvent } from '../models/chat-event-data/response-stream-event';

const MESSAGE_ITEM_TYPE = 'message';
// NOTE: Delta kinds that carry user-visible answer text. Reasoning (`reasoning_text`,
// `reasoning_summary_text`) and tool arguments (`function_call_arguments`) are deliberately
// ignored — the backend's `get_output_text` skips non-message items too, so folding them in
// would leak the model's thinking into the answer body.
const VISIBLE_DELTA_TYPES = ['output_text', 'text'];

interface ResponseStreamEntry {
  type: string;
  text: string;
}

// NOTE: Keyed by `output_index` rather than stored as a plain array because the stream is sparse:
// a delta can arrive for an item we never saw an `output_item.added` for.
export type ResponseStreamState = Map<number, ResponseStreamEntry>;

const getItemText = (item?: ChatCompletionOutputItem): string => {
  if (item?.type !== MESSAGE_ITEM_TYPE || !Array.isArray(item.content)) {
    return '';
  }

  return item.content.map((part) => (part?.text != null ? String(part.text) : '')).join('');
};

const getLastIndex = (state: ResponseStreamState): number => (state.size ? Math.max(...state.keys()) : 0);

export const createResponseStreamState = (): ResponseStreamState => new Map();

// NOTE: Seeds the accumulator from an authoritative full `output` snapshot. Open WebUI 0.11.1
// still sends such snapshots via `chat:completion` at tool-call boundaries, and subsequent deltas
// carry indices relative to that same array — so re-seeding by array position keeps them aligned.
export const seedResponseStreamState = (output?: Array<ChatCompletionOutputItem>): ResponseStreamState => {
  const state = createResponseStreamState();

  if (!Array.isArray(output)) {
    return state;
  }

  output.forEach((item, index) => {
    state.set(index, { type: item?.type ?? '', text: getItemText(item) });
  });

  return state;
};

// NOTE: Mutates `state` in place and reports whether the visible text may have changed. Returning
// a new Map per token would allocate once per delta on the hot streaming path.
export const applyResponseStreamEvent = (state: ResponseStreamState, event: ResponseStreamEvent): boolean => {
  const eventType = event?.type ?? '';

  if (!eventType.startsWith('response.')) {
    return false;
  }

  if (eventType === 'response.completed') {
    const output = event.response?.output;

    if (!output) {
      return false;
    }

    const seeded = seedResponseStreamState(output);
    state.clear();
    seeded.forEach((entry, index) => state.set(index, entry));

    return true;
  }

  if (eventType === 'response.output_item.added' || eventType === 'response.output_item.done') {
    if (!event.item) {
      return false;
    }

    const index = event.outputIndex ?? (state.size ? getLastIndex(state) + 1 : 0);
    state.set(index, { type: event.item.type ?? '', text: getItemText(event.item) });

    return true;
  }

  if (!eventType.endsWith('.delta')) {
    return false;
  }

  const deltaType = eventType.split('.')[1] ?? '';

  if (!VISIBLE_DELTA_TYPES.includes(deltaType) || !event.delta) {
    return false;
  }

  const index = event.outputIndex ?? getLastIndex(state);
  const entry = state.get(index);

  if (!entry) {
    state.set(index, { type: MESSAGE_ITEM_TYPE, text: event.delta });

    return true;
  }

  // NOTE: An answer-text delta targeting a reasoning item is skipped by the backend as well.
  if (entry.type !== MESSAGE_ITEM_TYPE) {
    return false;
  }

  entry.text += event.delta;

  return true;
};

// NOTE: Mirrors `getOutputText` — message items only, parts concatenated, items joined by newline.
export const getResponseStreamText = (state: ResponseStreamState): string => {
  const texts: Array<string> = [];

  for (const index of Array.from(state.keys()).sort((a, b) => a - b)) {
    const entry = state.get(index);

    if (entry?.type !== MESSAGE_ITEM_TYPE || !entry.text.trim()) {
      continue;
    }

    texts.push(entry.text);
  }

  return texts.join('\n');
};
