import { AskUserOption, AskUserPrompt, AskUserQuestion } from '../types';

type RawRecord = Record<string, unknown>;

const parseOptions = (rawOptions: unknown): Array<AskUserOption> =>
  Array.isArray(rawOptions)
    ? rawOptions.flatMap((rawOption: RawRecord) =>
        typeof rawOption?.label === 'string' && typeof rawOption?.description === 'string'
          ? [{ label: rawOption.label, description: rawOption.description }]
          : [],
      )
    : [];

// NOTE: The questions live in the `arguments` string of the pending `ask_user` function call. The
// backend already normalised and validated them (1-3 questions, 2-3 options each), but the value is
// still model-authored JSON coming over the wire, so every field is re-checked here.
export function parseAskUserPrompt(toolArguments?: string): AskUserPrompt | undefined {
  if (!toolArguments) {
    return undefined;
  }

  let parsed: RawRecord;

  try {
    parsed = JSON.parse(toolArguments);
  } catch {
    return undefined;
  }

  if (!Array.isArray(parsed?.questions)) {
    return undefined;
  }

  const allowOther = parsed['allow_other'] !== false;

  const questions = parsed.questions.flatMap((rawQuestion: RawRecord, index): Array<AskUserQuestion> => {
    const options = parseOptions(rawQuestion?.options);
    const rawAllowOther = rawQuestion?.['allow_other'];

    if (typeof rawQuestion?.id !== 'string' || !rawQuestion.id || !options.length) {
      return [];
    }

    return [
      {
        id: rawQuestion.id,
        header: typeof rawQuestion.header === 'string' && rawQuestion.header ? rawQuestion.header : `${index + 1}`,
        question: typeof rawQuestion.question === 'string' ? rawQuestion.question : '',
        options,
        allowOther: rawAllowOther === undefined ? allowOther : rawAllowOther !== false,
      },
    ];
  });

  return questions.length ? { questions, allowOther } : undefined;
}
