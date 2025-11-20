import { Image, ImageProps } from 'expo-image';
import { ReactElement } from 'react';
import { withClassNameInterop } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

export interface AppImageProps extends ImageProps {
  authorizationToken?: string;
  className?: string;
}

function AppImage({ source, authorizationToken, ...props }: AppImageProps): ReactElement {
  return (
    <Image
      source={
        typeof source === 'object'
          ? { headers: authorizationToken ? { Authorization: `Bearer ${authorizationToken}` } : undefined, ...source }
          : source
      }
      {...props}
    />
  );
}

withClassNameInterop(AppImage);

export { AppImage };
