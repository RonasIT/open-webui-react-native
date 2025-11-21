import { FlashList, ListRenderItem, ViewToken } from '@shopify/flash-list';
import { ReactElement, useCallback, useEffect, useRef } from 'react';
import { Modal, ModalProps, Platform } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useImageDownloader } from '@open-webui-react-native/mobile/shared/data-access/media-library-service';
import { useSwipeToClose } from '@open-webui-react-native/mobile/shared/features/use-swipe-to-close';
import { cn, screenWidth } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AnimatedView,
  AppImage,
  AppToast,
  AppZoom,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
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
  const listRef = useRef<FlashList<AttachedImageWithIndex>>(null);
  const token = appStorageService.token.get();
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

  const handleDownloadPress = (): void => {
    downloadImage(images[activeIndexRef.current].url, appStorageService.token.get());
  };

  const { panGesture, animatedOpacityStyles, animatedScaleStyles } = useSwipeToClose({ onReachDistance: onClosePress });

  const renderItem: ListRenderItem<AttachedImageWithIndex> = ({ item }) => (
    <AnimatedView style={animatedScaleStyles} className='w-screen h-screen'>
      <AppZoom isDoubleTapEnabled className='flex-1'>
        <AppImage
          className='w-screen h-screen'
          authorizationToken={token}
          contentFit='contain'
          source={{ uri: item.url }}
        />
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
          <AnimatedView style={animatedOpacityStyles} className='w-screen h-screen bg-black'>
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
            <FlashList<AttachedImageWithIndex>
              ref={listRef}
              data={images}
              renderItem={renderItem}
              estimatedItemSize={screenWidth}
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
