import { ImageRef, Image } from 'expo-image';
import { ReactElement, useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { AppImage, AppImageProps, AppPressable } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';
import { ImageSkeleton } from '../image-skeleton';

export interface AttachedImageViewProps extends AppImageProps {
  url: string;
  shouldUseAspectRatio?: boolean;
  shouldHideSkeleton?: boolean;
  onPress?: () => void;
}

export function AttachedImageView({
  url,
  shouldUseAspectRatio,
  shouldHideSkeleton,
  onPress,
  style,
  ...props
}: AttachedImageViewProps): ReactElement | null {
  const [image, setImage] = useState<ImageRef | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageOpacity = useSharedValue(shouldHideSkeleton ? 1 : 0);

  const aspectRatio = shouldUseAspectRatio && image?.width && image?.height ? image.width / image.height : undefined;

  const commonStyles = {
    aspectRatio,
    borderRadius: 8,
  };

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const loadImage = async (): Promise<void> => {
    const image = await Image.loadAsync({
      uri: url,
      headers: { Authorization: `Bearer ${appStorageService.token.get()}` },
    });
    setImage(image);

    if (!shouldHideSkeleton) {
      setIsLoaded(true);
      imageOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  useEffect(() => {
    loadImage();
  }, [url]);

  return (
    <AppPressable onPress={onPress} className='self-end relative'>
      <Animated.View style={imageAnimatedStyle}>
        <AppImage
          source={{ uri: url }}
          style={[commonStyles, style]}
          {...props} />
      </Animated.View>
      {!isLoaded && !shouldHideSkeleton && <ImageSkeleton />}
    </AppPressable>
  );
}
