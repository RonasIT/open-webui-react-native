import { Image, ImageProps } from 'expo-image';
import { ReactElement } from 'react';
import { withClassNameInterop } from '@open-webui-react-native/mobile/shared/ui/styles';

export interface AppImageProps extends ImageProps {
  className?: string;
}

function AppImage({ source, ...props }: AppImageProps): ReactElement {
  return (
    <Image
      source={source}
      {...props} />
  );
}

withClassNameInterop(AppImage);

export { AppImage };
