import { ReactElement } from 'react';
import { AppImage, AppPressable, IconButton } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

interface AttachedImageItemProps {
  image: ImageData;
  onImagePress: () => void;
  onDeleteImagePress: (uri: string) => void;
}

export function AttachedImageItem({ image, onImagePress, onDeleteImagePress }: AttachedImageItemProps): ReactElement {
  return (
    <AppPressable onPress={onImagePress} className='rounded-2xl self-start border border-text-secondary p-4'>
      <AppImage className='w-48 h-48 rounded-xl' source={{ uri: image.uri }} />
      <IconButton
        iconName='close'
        onPress={() => onDeleteImagePress(image.uri)}
        className='absolute active:opacity-1 active:bg-background-secondary bg-background-primary border border-text-secondary p-0 rounded-full items-center justify-center w-[20] h-[20] top-[-6] right-[-6]'
        iconProps={{ className: 'color-text-primary', width: 12 }}
      />
    </AppPressable>
  );
}
