import { ChatCompletionOutputItem } from '../models/chat-event-data/chat-completion-chunk';

// NOTE: Mirrors the backend `get_output_text` (open_webui/utils/misc.py). Concatenates the
// text of every `message` output item, joining separate messages with a newline. Non-message
// items (reasoning, tool calls, etc.) are ignored, matching the backend behavior.
export const getOutputText = (output?: Array<ChatCompletionOutputItem>): string => {
  if (!Array.isArray(output)) {
    return '';
  }

  const texts: Array<string> = [];

  for (const item of output) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) {
      continue;
    }

    const text = item.content.map((part) => (part?.text != null ? String(part.text) : '')).join('');

    if (text.trim()) {
      texts.push(text);
    }
  }

  return texts.join('\n');
};
