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
