import { delay } from 'lodash-es';
import { ReactElement } from 'react';
import { TextInputProps } from 'react-native';
import { uiState$ } from '@open-webui-react-native/mobile/shared/ui/ui-state';
import { AppTextInput, AppInputProps } from '../text-input';

export type AppBottomSheetTextInputProps = AppInputProps;

export const AppBottomSheetTextInput = ({
  onFocus,
  onBlur,
  ref,
  ...props
}: AppBottomSheetTextInputProps): ReactElement => {
  const handleFocus: TextInputProps['onFocus'] = (e): void => {
    uiState$.isBottomSheetInputFocused.set(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e): void => {
    onBlur?.(e);
    delay(() => uiState$.isBottomSheetInputFocused.set(false), 500);
  };

  return <AppTextInput
    ref={ref}
    onFocus={handleFocus}
    onBlur={handleBlur}
    {...props} />;
};
