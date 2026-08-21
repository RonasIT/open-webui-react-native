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
import { authApi, UpdateProfileRequest } from '@open-webui-react-native/shared/data-access/api';
import { ProfileNameFormSchema } from '../../forms';

export type ProfileNameSheetMethods = {
  present: () => void;
};

export type ProfileNameSheetRef = ForwardedRef<ProfileNameSheetMethods>;

export type ProfileNameSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  name?: string;
  avatarUrl?: string;
  ref?: ProfileNameSheetRef;
};

export function ProfileNameSheet({ name, avatarUrl, ref, ...props }: ProfileNameSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.PROFILE_NAME_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const nameInputRef = useRef<TextInput>(null);

  const { mutate: updateProfile, isPending } = authApi.useUpdateProfile();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new ProfileNameFormSchema(),
    resolver: yupResolver(ProfileNameFormSchema.validationSchema),
  });

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        reset(new ProfileNameFormSchema({ name }));
        sheetRef.current?.present();
      },
    }),
    [name],
  );

  //NOTE: Autofocus causes scrolling to an incorrect position
  const handleOpen = (): void => nameInputRef.current?.focus();

  const handleConfirmPress = handleSubmit((values) => {
    if (isPending) {
      return;
    }

    updateProfile(new UpdateProfileRequest({ name: values.name, profileImageUrl: avatarUrl || '' }), {
      onSuccess: closeSheet,
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
                name='name'
                control={control}
                label={translate('TEXT_PROFILE_NAME')}
                inputRef={nameInputRef}
              />
            </View>
          </AppBottomSheetKeyboardAwareScrollView>
        </View>
      }
    />
  );
}
