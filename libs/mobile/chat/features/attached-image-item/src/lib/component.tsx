import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import {
  AppImage,
  AppPressable,
  AppSpinner,
  AppText,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AttachmentStatus, ImageData } from '@open-webui-react-native/shared/data-access/common';

interface AttachedImageItemProps {
  image: ImageData;
  onImagePress: () => void;
  onDeleteImagePress: (uri: string) => void;
}

export function AttachedImageItem({ image, onImagePress, onDeleteImagePress }: AttachedImageItemProps): ReactElement {
  const translate = useTranslation('CHAT.ATTACHED_IMAGE_ITEM');

  return (
    <AppPressable onPress={onImagePress} className='rounded-2xl self-start border border-text-secondary p-4'>
      <AppImage className='w-48 h-48 rounded-xl' source={{ uri: image.uri }} />
      {image.status === AttachmentStatus.UPLOADING && (
        <View className='absolute inset-4 rounded-xl bg-background-primary/60 items-center justify-center'>
          <AppSpinner size='small' />
        </View>
      )}
      {image.status === AttachmentStatus.ERROR && (
        <View className='absolute inset-4 rounded-xl bg-background-primary/80 items-center justify-center p-8'>
          <AppText className='text-sm-sm sm:text-sm text-center text-status-danger'>
            {translate('TEXT_UPLOAD_FAILED')}
          </AppText>
        </View>
      )}
      <IconButton
        iconName='close'
        onPress={() => onDeleteImagePress(image.uri)}
        className='absolute active:opacity-1 active:bg-background-secondary bg-background-primary border border-text-secondary p-0 rounded-full items-center justify-center w-[20] h-[20] top-[-6] right-[-6]'
        iconProps={{ className: 'color-text-primary', width: 12 }}
      />
    </AppPressable>
  );
}
