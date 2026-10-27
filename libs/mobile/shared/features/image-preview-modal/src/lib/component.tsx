import { FlashList, ListRenderItem, ViewToken } from '@shopify/flash-list';
import React, { ReactElement, useCallback, useEffect, useRef } from 'react';
import { Modal, ModalProps, Platform } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useImageDownloader } from '@open-webui-react-native/mobile/shared/data-access/media-library-service';
import { useSwipeToClose } from '@open-webui-react-native/mobile/shared/features/use-swipe-to-close';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AnimatedView,
  AppFlashList,
  AppImage,
  AppToast,
  AppZoom,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { getServerImageSource } from '@open-webui-react-native/shared/data-access/api';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { AttachedImageWithIndex } from './types';

interface ImagePreviewModalProps extends Partial<ModalProps> {
  initialIndex?: number;
  images: Array<AttachedImageWithIndex>;
  onClosePress: () => void;
}

export function ImagePreviewModal({
  initialIndex,
  images,
  onClosePress,
  visible,
  ...modalProps
}: ImagePreviewModalProps): ReactElement {
  const isAndroid = Platform.OS === 'android';
  const listRef = useRef<React.ComponentRef<typeof FlashList<AttachedImageWithIndex>>>(null);
  const activeIndexRef = useRef<number>(initialIndex ?? 0);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken<AttachedImageWithIndex>> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        activeIndexRef.current = viewableItems[0].index;
      }
    },
    [],
  );

  const { downloadImage, isDownloading } = useImageDownloader();

  // NOTE: Images can come from markdown and point anywhere, so the token goes only to the app's own server.
  const handleDownloadPress = (): void => {
    const { uri, headers } = getServerImageSource(images[activeIndexRef.current].url);
    downloadImage(uri, headers ? (appStorageService.token.get() ?? undefined) : undefined);
  };

  const { panGesture, animatedOpacityStyles, animatedScaleStyles } = useSwipeToClose({ onReachDistance: onClosePress });

  const renderItem: ListRenderItem<AttachedImageWithIndex> = ({ item }) => (
    <AnimatedView style={animatedScaleStyles}>
      <AppZoom isDoubleTapEnabled className='flex-1'>
        <AppImage
          className='w-screen h-full'
          contentFit='contain'
          source={getServerImageSource(item.url)} />
      </AppZoom>
    </AnimatedView>
  );

  useEffect(() => {
    if (visible && listRef.current) {
      listRef.current.scrollToIndex({
        index: initialIndex || 0,
        animated: false,
      });
    }
  }, [visible, initialIndex]);

  return (
    <Modal
      animationType='fade'
      presentationStyle='overFullScreen'
      transparent
      visible={visible}
      {...modalProps}>
      <GestureHandlerRootView>
        <GestureDetector gesture={panGesture}>
          <AnimatedView style={animatedOpacityStyles} className='flex-1 bg-black'>
            <View
              className={cn(
                'absolute flex-row w-full left-0 right-0 top-safe px-16 items-center justify-between z-10',
                isAndroid && 'pt-8',
              )}>
              <IconButton
                onPress={onClosePress}
                iconName='close'
                className='p-0 pr-16 pb-16'
                iconProps={{ className: 'color-white' }}
              />
              <IconButton
                onPress={handleDownloadPress}
                iconName='download'
                className='p-0 pl-16 pb-16'
                iconProps={{ className: 'color-white' }}
                isLoading={isDownloading}
              />
            </View>
            <AppFlashList<AttachedImageWithIndex>
              className='flex-1'
              ref={listRef}
              data={images}
              renderItem={renderItem}
              horizontal
              pagingEnabled
              scrollEnabled
              initialScrollIndex={initialIndex}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 90,
              }}
            />
          </AnimatedView>
        </GestureDetector>
      </GestureHandlerRootView>
      <AppToast />
    </Modal>
  );
}
