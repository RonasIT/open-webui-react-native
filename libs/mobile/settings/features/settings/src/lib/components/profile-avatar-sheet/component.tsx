import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import {
  AppBottomSheet,
  AppBottomSheetPropsType,
  AppButton,
  Avatar,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export type ProfileAvatarSheetMethods = {
  present: () => void;
};

export type ProfileAvatarSheetRef = ForwardedRef<ProfileAvatarSheetMethods>;

export type ProfileAvatarSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  name?: string;
  imageUrl?: string;
  ref?: ProfileAvatarSheetRef;
};

export function ProfileAvatarSheet({ name, imageUrl, ref, ...props }: ProfileAvatarSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.PROFILE_AVATAR_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(ref, () => ({ present: () => sheetRef.current?.present() }), []);

  const handleUploadPress = async (): Promise<void> => {
    const image = await imagePickerService.getImage(ImagePickerSource.GALLERY);
    const asset = image?.assets?.[0];

    if (asset) {
      setPickedImageUri(asset.uri);
    }
  };

  const handleRestoreDefaultPress = (): void => setPickedImageUri(null);

  const currentImageUrl = pickedImageUri || imageUrl;

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={closeSheet} />
          <View className='gap-8'>
            <View className='items-center justify-center py-32'>
              <Avatar
                source={currentImageUrl ? { uri: currentImageUrl } : undefined}
                name={name}
                className='w-[112] h-[112]'
                textClassName='text-h2-sm sm:text-h2'
              />
            </View>
            <AppButton
              variant='outline'
              size='sm'
              iconName='exportIcon'
              text={translate('BUTTON_UPLOAD_PROFILE_IMAGE')}
              onPress={handleUploadPress}
            />
            <AppButton
              variant='outline'
              size='sm'
              disabled={!pickedImageUri}
              text={translate('BUTTON_RESTORE_DEFAULT_AVATAR')}
              onPress={handleRestoreDefaultPress}
            />
          </View>
        </View>
      }
    />
  );
}
