import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
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
import { compressImage } from '@open-webui-react-native/mobile/shared/utils/compressor';
import { authApi, UpdateProfileRequest } from '@open-webui-react-native/shared/data-access/api';
import { toDataUrl } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { profileAvatarSheetConfig } from './config';

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
  const sheetRef = useRef<BottomSheetModal>(null);

  const [pickedImageDataUrl, setPickedImageDataUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const { mutate: updateProfile, isPending } = authApi.useUpdateProfile();

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setPickedImageDataUrl(null);
        sheetRef.current?.present();
      },
    }),
    [],
  );

  const handleUploadPress = async (): Promise<void> => {
    const image = await imagePickerService.getImage(ImagePickerSource.GALLERY);
    const asset = image?.assets?.[0];

    if (!asset) {
      return;
    }

    if (asset.fileSize && asset.fileSize > profileAvatarSheetConfig.maxSourceFileSize) {
      ToastService.showError(translate('TEXT_IMAGE_TOO_LARGE'));

      return;
    }

    setIsProcessingImage(true);

    try {
      const compressedBase64 = await compressImage(asset.uri, {
        maxWidth: profileAvatarSheetConfig.avatarSize,
        maxHeight: profileAvatarSheetConfig.avatarSize,
        quality: 0.8,
        output: 'jpg',
        returnableOutputType: 'base64',
      });

      setPickedImageDataUrl(toDataUrl(compressedBase64, 'image/jpeg'));
    } catch {
      ToastService.showError(translate('TEXT_UPLOAD_FAILED'));
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRestoreDefaultPress = (): void => setPickedImageDataUrl(null);

  const handleConfirmPress = (): void => {
    if (!pickedImageDataUrl || !name || isPending) {
      closeSheet();

      return;
    }

    updateProfile(new UpdateProfileRequest({ name, profileImageUrl: pickedImageDataUrl }), {
      onSuccess: closeSheet,
    });
  };

  const currentImageUrl = pickedImageDataUrl || imageUrl;

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
            onConfirmPress={handleConfirmPress}
            confirmButtonProps={{ isLoading: isPending, disabled: isPending }}
          />
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
              isLoading={isProcessingImage}
              disabled={isProcessingImage || isPending}
              text={translate('BUTTON_UPLOAD_PROFILE_IMAGE')}
              onPress={handleUploadPress}
            />
            <AppButton
              variant='outline'
              size='sm'
              disabled={!pickedImageDataUrl || isPending}
              text={translate('BUTTON_RESTORE_DEFAULT_AVATAR')}
              onPress={handleRestoreDefaultPress}
            />
          </View>
        </View>
      }
    />
  );
}
