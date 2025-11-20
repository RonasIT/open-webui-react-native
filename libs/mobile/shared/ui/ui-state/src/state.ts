import { observable } from '@legendapp/state';

interface UIState {
  isBottomSheetInputFocused: boolean;
}

export const uiState$ = observable<UIState>({
  isBottomSheetInputFocused: false,
});
