export type AskUserOption = {
  label: string;
  description: string;
};

export type AskUserQuestion = {
  id: string;
  header: string;
  question: string;
  options: Array<AskUserOption>;
  allowOther: boolean;
};

export type AskUserPrompt = {
  questions: Array<AskUserQuestion>;
  allowOther: boolean;
};

// The answer being composed in the UI. Converted to the wire shape by `buildAskUserAnswers`.
export type AskUserDraftAnswer =
  { type: 'option'; optionIndex: number; label: string; description: string } | { type: 'other'; text: string };

export type AskUserDraftAnswers = Record<string, AskUserDraftAnswer>;
