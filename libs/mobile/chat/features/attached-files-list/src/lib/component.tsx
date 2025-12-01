import { Observable } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { ReactElement } from 'react';
import { AttachedFileItem } from '@open-webui-react-native/mobile/chat/features/attached-file-item';
import { AttachedImageItem } from '@open-webui-react-native/mobile/chat/features/attached-image-item';
import { View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileData, ImageData } from '@open-webui-react-native/shared/data-access/common';

interface AttachedFilesListProps {
  onDeleteFilePress: (id: string) => void;
  attachedFiles: Observable<Array<FileData>>;
  onImagePress: (index: number) => void;
  onDeleteImagePress: (uri: string) => void;
  attachedImages: Observable<Array<ImageData>>;
}

export function AttachedFilesList({
  onDeleteFilePress,
  attachedFiles,
  onImagePress,
  onDeleteImagePress,
  attachedImages,
}: AttachedFilesListProps): ReactElement | null {
  const files = useSelector(attachedFiles);
  const images = useSelector(attachedImages);

  if (files.length === 0 && images.length === 0) {
    return null;
  }

  return (
    <View className='gap-8 mb-[8]'>
      {files?.map((file) => (
        <AttachedFileItem
          key={file.id}
          file={file}
          onDeleteFilePress={onDeleteFilePress} />
      ))}
      <View className='gap-8 flex-row flex-wrap'>
        {images?.map((image, index) => (
          <AttachedImageItem
            key={image.uri}
            onImagePress={() => onImagePress(index)}
            onDeleteImagePress={onDeleteImagePress}
            image={image}
          />
        ))}
      </View>
    </View>
  );
}
