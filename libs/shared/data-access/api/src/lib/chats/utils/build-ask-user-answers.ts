import { AskUserDraftAnswers } from '../types';

// NOTE: The result is forwarded verbatim to the model as the `ask_user` tool result, so its keys
// have to match what the Open WebUI web client sends — otherwise the same model sees two different
// answer shapes depending on which client the user answered from. Hence the snake_case here and the
// camelCase draft type it is built from.
export function buildAskUserAnswers(draftAnswers: AskUserDraftAnswers): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(draftAnswers).map(([questionId, answer]) => [
      questionId,
      answer.type === 'option'
        ? {
            type: 'option',
            option_index: answer.optionIndex,
            label: answer.label,
            description: answer.description,
          }
        : { type: 'other', text: answer.text.trim() },
    ]),
  );
}
