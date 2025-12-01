import { Fragment, ReactElement, useRef } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppModalHandle,
  AppPressable,
  AppPressableProps,
  AppText,
  Icon,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { FileInfoModal } from './components';
import { formatFileSize, resolveFileType } from './utils';

interface AttachedFileItemProps {
  file: FileData;
  onDeleteFilePress?: (id: string) => void;
  className?: AppPressableProps['className'];
}

export function AttachedFileItem({ file, onDeleteFilePress, className }: AttachedFileItemProps): ReactElement {
  const modalRef = useRef<AppModalHandle>(null);

  const handleFilePress = (): void => {
    modalRef.current?.open();
  };

  return (
    <Fragment>
      <AppPressable
        onPress={handleFilePress}
        className={cn('relative rounded-2xl flex-row gap-16 border border-text-secondary p-4', className)}>
        <View className='items-center justify-center rounded-xl h-48 w-48 bg-black/20 dark:bg-white/20'>
          <Icon name='file' className='color-icon-primary-inverted' />
        </View>
        <View className='flex-1 flex-col justify-between'>
          <AppText className='text-md-sm sm:text-md font-medium'>{file.filename}</AppText>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{resolveFileType(file)}</AppText>
        </View>
        <AppText className='self-end text-sm-sm sm:text-sm text-text-secondary'>
          {formatFileSize(file.meta.size)}
        </AppText>
        {onDeleteFilePress && (
          <IconButton
            iconName='close'
            hitSlop={8}
            onPress={() => onDeleteFilePress?.(file.id)}
            className='absolute active:opacity-1 active:bg-background-secondary bg-background-primary border border-text-secondary p-0 rounded-full items-center justify-center w-[20] h-[20] top-[-6] right-[-6]'
            iconProps={{ className: 'color-text-primary', width: 12 }}
          />
        )}
      </AppPressable>
      <FileInfoModal file={file} modalRef={modalRef} />
    </Fragment>
  );
}
