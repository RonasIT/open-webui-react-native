import { ImageProps } from 'expo-image';
import { ReactElement } from 'react';
import { AppImage } from '../image';
import { View } from '../view';

interface AvatarProps {
  source: ImageProps['source'];
}

export function Avatar({ source }: AvatarProps): ReactElement {
  return (
    <View className='w-24 h-24 rounded-full justify-center items-center'>
      <AppImage
        source={source}
        className='w-full h-full rounded-full'
        contentFit='cover' />
    </View>
  );
}
