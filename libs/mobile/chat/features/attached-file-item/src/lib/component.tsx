import { Fragment, ReactElement, useRef } from 'react';
import { AppModalHandle, AppPressableProps, AttachedItem } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { FileInfoModal } from './components';

interface AttachedFileItemProps {
  file: FileData;
  subtitle: string;
  onDeleteFilePress?: (id: string) => void;
  className?: AppPressableProps['className'];
}

export function AttachedFileItem({
  file,
  subtitle,
  onDeleteFilePress,
  className,
}: AttachedFileItemProps): ReactElement {
  const modalRef = useRef<AppModalHandle>(null);

  const handleFilePress = (): void => {
    modalRef.current?.open();
  };

  return (
    <Fragment>
      <AttachedItem
        title={file.filename}
        subTitle={subtitle}
        iconName='file'
        className={className}
        onPress={handleFilePress}
        onDeletePress={onDeleteFilePress ? () => onDeleteFilePress(file.id) : undefined}
      />
      <FileInfoModal file={file} modalRef={modalRef} />
    </Fragment>
  );
}
