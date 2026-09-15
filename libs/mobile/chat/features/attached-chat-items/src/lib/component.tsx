import { Observable } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { AttachedFileItem, formatFileSize } from '@open-webui-react-native/mobile/chat/features/attached-file-item';
import { AttachedImageItem } from '@open-webui-react-native/mobile/chat/features/attached-image-item';
import { AttachedItem, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AttachedListItem, ImageData } from '@open-webui-react-native/shared/data-access/common';

interface AttachedChatItemsProps {
  onDeleteItemPress: (id: string) => void;
  attachedItems: Observable<Array<AttachedListItem>>;
  onImagePress: (index: number) => void;
  onDeleteImagePress: (uri: string) => void;
  attachedImages: Observable<Array<ImageData>>;
}

export function AttachedChatItems({
  onDeleteItemPress,
  attachedItems,
  onImagePress,
  onDeleteImagePress,
  attachedImages,
}: AttachedChatItemsProps): ReactElement | null {
  const translate = useTranslation('CHAT.ATTACHED_CHAT_ITEMS');
  const items = useSelector(attachedItems);
  const images = useSelector(attachedImages);

  if (items.length === 0 && images.length === 0) {
    return null;
  }

  return (
    <View className='gap-8 mb-[8]'>
      {items.map((item) => {
        if (!item) {
          return null;
        }

        return item.kind === 'collection' ? (
          <AttachedItem
            key={item.collection.id}
            disabled
            title={item.collection.name}
            subTitle={translate('TEXT_COLLECTION')}
            iconName='database'
            onDeletePress={() => onDeleteItemPress(item.collection.id)}
          />
        ) : (
          <AttachedFileItem
            key={item.file.id}
            file={item.file}
            subtitle={item.isFromKnowledge ? translate('TEXT_FILE') : formatFileSize(item.file.meta.size)}
            onDeleteFilePress={onDeleteItemPress}
          />
        );
      })}
      <View className='gap-8 flex-row flex-wrap'>
        {images.map((image, index) =>
          image ? (
            <AttachedImageItem
              key={image.uri}
              onImagePress={() => onImagePress(index)}
              onDeleteImagePress={onDeleteImagePress}
              image={image}
            />
          ) : null,
        )}
      </View>
    </View>
  );
}
