import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { delay } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { AppKeyboardAvoidingView } from '@open-webui-react-native/mobile/shared/ui/keyboard-avoiding-view';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AppBottomSheet } from '../bottom-sheet';
import { AppButton } from '../button';
import { AppText } from '../text';
import { AppTextInput } from '../text-input';
import { View } from '../view';

export type ActionButtonsModalMethods = {
  present: (value?: string) => void;
  close: () => void;
};

export type ActionButtonsModalRef = ForwardedRef<ActionButtonsModalMethods>;

export interface ActionButtonsModalProps {
  title: string;
  onConfirm: (value: string) => void;
  isConfirming?: boolean;
  description?: string | ReactElement;
  withInput?: boolean;
  ref?: ActionButtonsModalRef;
  isScrollable?: boolean;
}

export function ActionButtonsModal({
  title,
  onConfirm,
  isConfirming,
  description,
  withInput,
  ref,
  isScrollable,
}: ActionButtonsModalProps): ReactElement {
  const translate = useTranslation('SHARED.ACTION_BUTTONS_MODAL');
  const modalRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);

  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => {
    return {
      present: (value?: string) => {
        setValue(value || '');
        modalRef.current?.present();
      },
      close: closeModal,
    };
  }, []);

  const closeModal = (): void => {
    modalRef.current?.close();
    delay(() => inputRef.current?.blur(), 500);
  };

  const handleConfirm = (): void => {
    if (withInput && !value.trim()) {
      ToastService.showError(translate('TEXT_TITLE_CAN_NOT_BE_EMPTY'));

      return;
    }
    onConfirm(value);
  };

  return (
    <AppBottomSheet
      ref={modalRef}
      isModal={true}
      onOpen={() => inputRef.current?.focus()}
      withoutKeyboardExtraPadding
      content={
        <AppKeyboardAvoidingView
          scrollEnabled={isScrollable}
          contentContainerStyleKeyboardShown={{ paddingBottom: 16 }}>
          <View className='gap-12 pt-20 pb-safe android:pb-24'>
            <AppText className='text-h3-sm sm:text-h3 font-medium mb-4' numberOfLines={1}>
              {title}
            </AppText>
            {description &&
              (typeof description === 'string' ? (
                <AppText className='text-text-secondary'>{description}</AppText>
              ) : (
                description
              ))}
            {withInput && <AppTextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue} />}
            <View className='flex-row gap-8'>
              <AppButton
                variant='outline'
                text={translate('BUTTON_CANCEL')}
                onPress={closeModal}
                disabled={isConfirming}
                className='flex-1'
              />
              <AppButton
                text={translate('BUTTON_CONFIRM')}
                onPress={handleConfirm}
                isLoading={isConfirming}
                className='flex-1'
              />
            </View>
          </View>
        </AppKeyboardAvoidingView>
      }
    />
  );
}
