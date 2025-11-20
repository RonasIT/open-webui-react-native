import { ImageContentFit } from 'expo-image';
import { ReactElement } from 'react';
import { AttachedImageWithIndex } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/image-preview-modal';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppImageProps,
  AppPressable,
  AppText,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';
import { AttachedImageView } from '../attached-image';
import { chatImagesGroupConfig } from './config';

interface ChatImagesGroupProps {
  images: Array<AttachedImageWithIndex>;
  onShowAllImages: () => void;
  onImagePress: (index: number) => void;
  isAlignLeft?: boolean;
  contentFit?: ImageContentFit;
  containerClassName?: string;
  shouldHideSkeleton?: boolean;
}

export function ChatImagesGroup({
  images,
  onImagePress,
  onShowAllImages,
  isAlignLeft,
  contentFit,
  containerClassName,
  shouldHideSkeleton,
}: ChatImagesGroupProps): ReactElement | null {
  const token = appStorageService.token.get();

  const { maxHeight, maxWidth, gap } = chatImagesGroupConfig;
  const count = images.length;
  if (count === 0) return null;

  const renderImage = (
    index: number,
    url: string,
    style: AppImageProps['style'],
    shouldUseAspectRatio?: boolean,
  ): ReactElement => (
    <AttachedImageView
      onPress={() => onImagePress(index)}
      url={url}
      key={index}
      style={style}
      shouldUseAspectRatio={shouldUseAspectRatio}
      shouldHideSkeleton={shouldHideSkeleton}
      authorizationToken={token}
      contentFit={contentFit}
    />
  );

  switch (count) {
    case 1: {
      return (
        <View className={cn(isAlignLeft ? 'self-start' : 'self-end', containerClassName)}>
          {renderImage(images[0].index, images[0].url, { maxWidth, width: '100%', maxHeight }, true)}
        </View>
      );
    }

    case 2: {
      const tileSize = (maxWidth - gap) / 2;

      return (
        <View className={cn('flex-row self-end', isAlignLeft && 'self-start', containerClassName)} style={{ gap }}>
          {images.map((img) => renderImage(img.index, img.url, { width: tileSize, height: maxHeight }))}
        </View>
      );
    }

    case 3: {
      const leftWidth = (maxWidth - gap) * 0.66;
      const rightWidth = (maxWidth - gap) * 0.34;
      const halfHeight = (maxHeight - gap) / 2;

      return (
        <View
          className={cn('flex-row self-end justify-end', isAlignLeft && 'self-start', containerClassName)}
          style={{ width: maxWidth, gap }}>
          {renderImage(images[0].index, images[0].url, { width: leftWidth, height: maxHeight })}
          <View className='justify-between' style={{ width: rightWidth, height: leftWidth, gap }}>
            {images
              .slice(1, 3)
              .map((img) => renderImage(img.index, img.url, { width: rightWidth, height: halfHeight }))}
          </View>
        </View>
      );
    }

    case 4: {
      const leftWidth = (maxWidth - gap) * 0.66;
      const rightWidth = (maxWidth - gap) * 0.34;
      const tileHeight = (maxHeight - 2 * gap) / 3;

      return (
        <View
          className={cn('flex-row self-end', isAlignLeft && 'self-start', containerClassName)}
          style={{ width: maxWidth, gap }}>
          {renderImage(images[0].index, images[0].url, { width: leftWidth, height: maxHeight })}
          <View className='justify-between' style={{ width: rightWidth, height: leftWidth, gap }}>
            {images.slice(1).map((img) => renderImage(img.index, img.url, { width: rightWidth, height: tileHeight }))}
          </View>
        </View>
      );
    }

    case 5: {
      const topTileWidth = (maxWidth - gap) / 2;
      const bottomTileWidth = (maxWidth - 2 * gap) / 3;

      return (
        <View
          className={cn(isAlignLeft ? 'self-start' : 'self-end', containerClassName)}
          style={{ width: maxWidth, gap }}>
          <View className='flex-row' style={{ gap }}>
            {images
              .slice(0, 2)
              .map((img) => renderImage(img.index, img.url, { width: topTileWidth, height: topTileWidth }))}
          </View>
          <View className='flex-row' style={{ gap }}>
            {images
              .slice(2, 5)
              .map((img) => renderImage(img.index, img.url, { width: bottomTileWidth, height: bottomTileWidth }))}
          </View>
        </View>
      );
    }

    case 6: {
      const tileSize = (maxWidth - 2 * gap) / 3;

      return (
        <View
          className={cn(isAlignLeft ? 'self-start' : 'self-end', containerClassName)}
          style={{ width: maxWidth, gap }}>
          <View className='flex-row' style={{ gap }}>
            {images.slice(0, 3).map((img) => renderImage(img.index, img.url, { width: tileSize, height: tileSize }))}
          </View>
          <View className='flex-row' style={{ gap }}>
            {images.slice(3, 6).map((img) => renderImage(img.index, img.url, { width: tileSize, height: tileSize }))}
          </View>
        </View>
      );
    }

    default: {
      const displayedImages = images.slice(0, 5);
      const restCount = count - 5;
      const tileSize = (maxWidth - 2 * gap) / 3;

      return (
        <View
          className={cn(isAlignLeft ? 'self-start' : 'self-end', containerClassName)}
          style={{ width: maxWidth, gap }}>
          <View className='flex-row' style={{ gap }}>
            {displayedImages
              .slice(0, 3)
              .map((img) => renderImage(img.index, img.url, { width: tileSize, height: tileSize }))}
          </View>
          <View className='flex-row' style={{ gap }}>
            {displayedImages
              .slice(3, 5)
              .map((img) => renderImage(img.index, img.url, { width: tileSize, height: tileSize }))}
            <AppPressable
              onPress={onShowAllImages}
              className='items-center justify-center rounded-lg overflow-hidden'
              style={{ width: tileSize, height: tileSize }}>
              <AttachedImageView url={images[5].url} style={{ width: tileSize, height: tileSize }} />
              <View className='absolute w-full h-full bg-black/60 items-center justify-center'>
                <View className='rounded-full p-8 bg-black/40'>
                  <AppText className='text-white text-md-sm sm:text-md font-bold'>+{restCount}</AppText>
                </View>
              </View>
            </AppPressable>
          </View>
        </View>
      );
    }
  }
}
