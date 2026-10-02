import { Observable } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { AttachedFileItem, formatFileSize } from '@open-webui-react-native/mobile/chat/features/attached-file-item';
import { AttachedImageItem } from '@open-webui-react-native/mobile/chat/features/attached-image-item';
import { View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AttachedListItem,
  AttachmentStatus,
  FileType,
  ImageData,
} from '@open-webui-react-native/shared/data-access/common';
import { AttachedContextItem } from './components/attached-context-item';

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

        if (item.kind === FileType.COLLECTION) {
          return (
            <AttachedContextItem
              key={item.collection.id}
              type={FileType.COLLECTION}
              name={item.collection.name}
              onDeletePress={() => onDeleteItemPress(item.collection.id)}
            />
          );
        }

        if (item.kind === FileType.TEXT) {
          return (
            <AttachedContextItem
              key={item.webpage.url}
              type={FileType.TEXT}
              name={item.webpage.name}
              hasError={item.webpage.status === AttachmentStatus.ERROR}
              onDeletePress={() => onDeleteItemPress(item.webpage.url)}
            />
          );
        }

        if (item.kind === FileType.CHAT) {
          return (
            <AttachedContextItem
              key={item.chat.id}
              type={FileType.CHAT}
              name={item.chat.name}
              onDeletePress={() => onDeleteItemPress(item.chat.id)}
            />
          );
        }

        return (
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
