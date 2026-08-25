import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  FormFloatedLabelInput,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi, UpdatePasswordRequest } from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ChangePasswordFormSchema } from '../../forms';

export type ChangePasswordSheetMethods = {
  present: () => void;
};

export type ChangePasswordSheetRef = ForwardedRef<ChangePasswordSheetMethods>;

export type ChangePasswordSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  ref?: ChangePasswordSheetRef;
};

export function ChangePasswordSheet({ ref, ...props }: ChangePasswordSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.CHANGE_PASSWORD_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { mutate: updatePassword, isPending } = authApi.useUpdatePassword();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new ChangePasswordFormSchema(),
    resolver: yupResolver(ChangePasswordFormSchema.validationSchema),
  });

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        reset(new ChangePasswordFormSchema());
        sheetRef.current?.present();
      },
    }),
    [],
  );

  //NOTE: Autofocus causes scrolling to an incorrect position
  const handleOpen = (): void => currentPasswordRef.current?.focus();

  const handleConfirmPress = handleSubmit((values) => {
    if (isPending) {
      return;
    }

    updatePassword(new UpdatePasswordRequest({ password: values.currentPassword, newPassword: values.newPassword }), {
      onSuccess: () => {
        closeSheet();
        ToastService.showSuccess(translate('TEXT_PASSWORD_CHANGED'));
      },
    });
  });

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      onOpen={handleOpen}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress}
            confirmButtonProps={{ isLoading: isPending, disabled: isPending }}
          />
          <AppBottomSheetKeyboardAwareScrollView>
            <View className='pt-8 gap-16' style={{ paddingBottom: bottom + 24 }}>
              <FormFloatedLabelInput
                name='currentPassword'
                control={control}
                inputRef={currentPasswordRef}
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType='next'
                enablesReturnKeyAutomatically
                label={translate('TEXT_CURRENT_PASSWORD')}
                placeholder={translate('TEXT_ENTER_CURRENT_PASSWORD')}
                onSubmitEditing={() => newPasswordRef.current?.focus()}
              />
              <FormFloatedLabelInput
                name='newPassword'
                control={control}
                inputRef={newPasswordRef}
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType='next'
                enablesReturnKeyAutomatically
                label={translate('TEXT_NEW_PASSWORD')}
                placeholder={translate('TEXT_ENTER_NEW_PASSWORD')}
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <FormFloatedLabelInput
                name='confirmPassword'
                control={control}
                inputRef={confirmPasswordRef}
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType='done'
                enablesReturnKeyAutomatically
                label={translate('TEXT_CONFIRM_NEW_PASSWORD')}
                placeholder={translate('TEXT_ENTER_CONFIRM_NEW_PASSWORD')}
                onSubmitEditing={handleConfirmPress}
              />
            </View>
          </AppBottomSheetKeyboardAwareScrollView>
        </View>
      }
    />
  );
}
