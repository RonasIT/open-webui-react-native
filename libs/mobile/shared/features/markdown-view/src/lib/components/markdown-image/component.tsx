import { ImageLoadEventData } from 'expo-image';
import { Fragment, ReactElement, useMemo, useState } from 'react';
import { ImagePreviewModal } from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { AppImage, AppPressable, AppText } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { getServerImageSource } from '@open-webui-react-native/shared/data-access/api';
import { FileType } from '@open-webui-react-native/shared/data-access/common';

// NOTE: Reserves space until the real size is known; matches the default figure of code interpreter charts.
const placeholderAspectRatio = 4 / 3;

// NOTE: Markdown from the model is untrusted, so local schemes like `file:` are not loaded.
const allowedUriPattern = /^(https?:|data:image\/)/i;

interface MarkdownImageProps {
  source: string;
  alt?: string;
}

interface LoadedImage {
  uri: string;
  aspectRatio: number;
}

export function MarkdownImage({ source, alt }: MarkdownImageProps): ReactElement | null {
  const imageSource = useMemo(() => getServerImageSource(source), [source]);
  const [loadedImage, setLoadedImage] = useState<LoadedImage>();
  const [failedUri, setFailedUri] = useState<string>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const aspectRatio = loadedImage?.uri === imageSource.uri ? loadedImage.aspectRatio : placeholderAspectRatio;

  const handleLoad = ({ source: { width, height } }: ImageLoadEventData): void => {
    if (width > 0 && height > 0) {
      setLoadedImage({ uri: imageSource.uri, aspectRatio: width / height });
    }
  };

  if (failedUri === imageSource.uri || !allowedUriPattern.test(imageSource.uri)) {
    return alt ? <AppText className='text-text-secondary'>{alt}</AppText> : null;
  }

  return (
    <Fragment>
      <AppPressable
        onPress={() => setIsPreviewVisible(true)}
        accessibilityRole='button'
        accessibilityLabel={alt}
        className='my-8 w-full'>
        <AppImage
          source={imageSource}
          contentFit='contain'
          onLoad={handleLoad}
          onError={() => setFailedUri(imageSource.uri)}
          className='rounded-sm bg-background-tertiary'
          style={{ width: '100%', aspectRatio }}
        />
      </AppPressable>
      {isPreviewVisible && (
        <ImagePreviewModal
          visible
          images={[{ type: FileType.IMAGE, url: imageSource.uri, index: 0 }]}
          onClosePress={() => setIsPreviewVisible(false)}
        />
      )}
    </Fragment>
  );
}
