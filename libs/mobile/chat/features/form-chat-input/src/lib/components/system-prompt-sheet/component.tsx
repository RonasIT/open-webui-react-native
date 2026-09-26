import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import {
  AppBottomSheet,
  BottomSheetTextInput,
  BottomSheetTextInputRef,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { uiState$ } from '@open-webui-react-native/mobile/shared/ui/ui-state';

export type SystemPromptSheetMethods = {
  present: (currentValue: string) => void;
};

export type SystemPromptSheetRef = ForwardedRef<SystemPromptSheetMethods>;

export interface SystemPromptSheetProps {
  ref?: SystemPromptSheetRef;
  onSave: (value: string) => void;
  onClose?: () => void;
}

export function SystemPromptSheet({ ref, onSave, onClose }: SystemPromptSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.SYSTEM_PROMPT_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<BottomSheetTextInputRef>(null);

  const [value, setValue] = useState('');

  const closeSheet = (): void => {
    sheetRef.current?.close();
  };

  useImperativeHandle(
    ref,
    () => ({
      present: (currentValue: string) => {
        setValue(currentValue);
        sheetRef.current?.present();
      },
    }),
    [],
  );

  const handleOpen = (): void => {
    inputRef.current?.focus();
  };

  const handleSavePress = (): void => {
    onSave(value.trim());
    closeSheet();
  };

  return (
    <AppBottomSheet
      isModal
      ref={sheetRef}
      onOpen={handleOpen}
      onDismiss={() => {
        Keyboard.dismiss();
        onClose?.();
      }}
      content={
        <View className='gap-16'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleSavePress} />
          <BottomSheetTextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            onBlur={() => uiState$.isBottomSheetInputFocused.set(false)}
            onFocus={() => uiState$.isBottomSheetInputFocused.set(true)}
            placeholder={translate('TEXT_PLACEHOLDER')}
            multiline
            numberOfLines={6}
            textClassName='min-h-[144px]'
          />
        </View>
      }
    />
  );
}
