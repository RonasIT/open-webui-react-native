import { Observable, observable } from '@legendapp/state';
import { ChatGenerationOption, ToolApprovalMode } from './enums';

interface ToolApprovalState {
  // NOTE: Session-scoped rather than persisted with the chat: the mode is only meaningful while a
  // completion is running, and the backend defaults a resumed turn to `ask` on its own.
  mode: ToolApprovalMode;
}

export const toolApprovalState$: Observable<ToolApprovalState> = observable<ToolApprovalState>({
  mode: ToolApprovalMode.FULL,
});

export interface ChatSelection {
  // The model the selection was made for. Switching the model falls back to that model's own
  // defaults instead of carrying over a selection meant for the previous one.
  modelId?: string;
  // Each field stays unset until the user changes it, so the rest keep following the model defaults.
  toolIds?: Array<string>;
  generationOptions?: Array<ChatGenerationOption>;
}

// Key holding the selection of a chat that does not exist yet, made on the create-chat screen.
// `useCreateNewChat` moves it onto the real chat id as soon as the backend assigns one.
export const NEW_CHAT_SELECTION_KEY = 'new';

// NOTE: The tools and generation options picked in the chat input live here rather than in the
// input's own state because the create-chat screen and the chat screen mount separate inputs, and
// edit/suggest modes unmount it — a selection would otherwise be lost on the way. Session-scoped,
// like the approval mode: the backend does not persist them, and the web interface keeps them in
// local storage only.
export const chatSelectionState$: Observable<Record<string, ChatSelection>> = observable<Record<string, ChatSelection>>(
  {},
);

// The part of a chat's selection that applies to the given model — none when it was made for another.
export function getChatSelectionForModel(selection?: ChatSelection, modelId?: string): ChatSelection {
  return selection && selection.modelId === modelId ? selection : {};
}

export function updateChatSelection(
  key: string,
  modelId: string | undefined,
  changes: Omit<ChatSelection, 'modelId'>,
): void {
  const selection = getChatSelectionForModel(chatSelectionState$[key].peek(), modelId);

  chatSelectionState$[key].set({ ...selection, ...changes, modelId });
}

// Key holding the system prompt of a chat that does not exist yet, set on the create-chat screen.
// `useCreateNewChat` reads it into the creation payload as soon as the backend assigns a real id.
export const NEW_CHAT_SYSTEM_PROMPT_KEY = 'new';

// NOTE: A chat's own system prompt (chat.params.system) is normally read straight from the chat
// entity returned by the backend — this state only stages the value chosen before a chat/message
// exists yet.
export const chatSystemPromptState$: Observable<Record<string, string>> = observable<Record<string, string>>({});

// The observables above hold choices of the signed-in user, keyed by chats only that user can
// open, so they must not outlive the session — the next account would inherit selections for
// chat ids it has no access to. Called from `useLogout`, which also covers the forced 401 logout.
export function resetChatSessionState(): void {
  toolApprovalState$.mode.set(ToolApprovalMode.FULL);
  chatSelectionState$.set({});
  chatSystemPromptState$.set({});
}
