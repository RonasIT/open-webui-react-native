import { Observable, observable } from '@legendapp/state';
import { ToolApprovalMode } from './enums';

interface ToolApprovalState {
  // NOTE: Session-scoped rather than persisted with the chat: the mode is only meaningful while a
  // completion is running, and the backend defaults a resumed turn to `ask` on its own.
  mode: ToolApprovalMode;
}

export const toolApprovalState$: Observable<ToolApprovalState> = observable<ToolApprovalState>({
  mode: ToolApprovalMode.FULL,
});

export interface ToolsSelection {
  // The model the selection was made for. Switching the model falls back to that model's own
  // default tools instead of carrying over a selection meant for the previous one.
  modelId?: string;
  toolIds: Array<string>;
}

// Key holding the selection of a chat that does not exist yet, made on the create-chat screen.
// `useCreateNewChat` moves it onto the real chat id as soon as the backend assigns one.
export const NEW_CHAT_TOOLS_SELECTION_KEY = 'new';

// NOTE: Selected tools live here rather than in the chat input's own state because the create-chat
// screen and the chat screen mount separate inputs — a selection made before the first message
// would otherwise be lost the moment the chat opens. Session-scoped, like the approval mode: the
// backend does not persist a chat's tools, and the web interface keeps them in local storage only.
export const toolsSelectionState$: Observable<Record<string, ToolsSelection>> = observable<
  Record<string, ToolsSelection>
>({});
