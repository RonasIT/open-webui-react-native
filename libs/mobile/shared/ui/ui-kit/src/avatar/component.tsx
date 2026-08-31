import { ImageProps } from 'expo-image';
import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { getInitials } from '@open-webui-react-native/shared/utils/strings';
import { AppImage } from '../image';
import { AppText } from '../text';
import { View } from '../view';

interface AvatarProps {
  source?: ImageProps['source'];
  name?: string;
  className?: string;
  textClassName?: string;
}

export function Avatar({ source, name, className, textClassName }: AvatarProps): ReactElement {
  return (
    <View
      className={cn('w-24 h-24 rounded-full justify-center items-center bg-status-warning overflow-hidden', className)}>
      {source ? (
        <AppImage
          source={source}
          className='w-full h-full rounded-full'
          contentFit='cover' />
      ) : (
        <AppText className={cn('text-xs-sm sm:text-xs text-text-foreground', textClassName)}>
          {getInitials(name ?? '')}
        </AppText>
      )}
    </View>
  );
}
