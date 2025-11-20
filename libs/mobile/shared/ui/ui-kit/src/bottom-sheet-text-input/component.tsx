import { delay } from 'lodash-es';
import { ReactElement } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { uiState$ } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-state';
import { AppTextInput, AppInputProps } from '../text-input';

export type AppBottomSheetTextInputProps = AppInputProps;

export const AppBottomSheetTextInput = ({
  onFocus,
  onBlur,
  ref,
  ...props
}: AppBottomSheetTextInputProps): ReactElement => {
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    uiState$.isBottomSheetInputFocused.set(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    onBlur?.(e);
    delay(() => uiState$.isBottomSheetInputFocused.set(false), 500);
  };

  return <AppTextInput
    ref={ref}
    onFocus={handleFocus}
    onBlur={handleBlur}
    {...props} />;
};
