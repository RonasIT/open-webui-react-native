import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import {
  AppModal,
  AppModalProps,
  AppScrollView,
  AppText,
  Icon,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { filesApi } from '@open-webui-react-native/shared/data-access/api';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { prepareFileInfo } from '../../utils';

interface FileInfoModalProps extends AppModalProps {
  file: FileData;
}

export const FileInfoModal = ({ file, ...modalProps }: FileInfoModalProps): ReactElement => {
  const translate = useTranslation('CHAT.ATTACHED_FILE_ITEM.FILE_INFO_MODAL');

  // NOTE: A file's extracted text isn't always already in memory (e.g. a file picked from a
  // knowledge base only ever carries its metadata), so it's fetched on demand once the modal
  // is actually shown, same as the web app does.
  const [shouldFetchContent, setShouldFetchContent] = useState(false);

  const { data: fetchedContent } = filesApi.useGetFileContent(shouldFetchContent ? file.id : undefined);

  const content = file.data?.content || fetchedContent?.content;

  return (
    <AppModal {...modalProps} onModalShow={() => setShouldFetchContent(true)}>
      <View className='gap-4'>
        <AppText className='font-medium text-lg-sm sm:text-lg'>{file.filename}</AppText>
        <AppText className='text-text-secondary'>{prepareFileInfo(file, content)}</AppText>
        <View className='flex-row gap-4'>
          <Icon
            name='alert'
            className='color-text-secondary'
            width={16} />
          <AppText className='text-text-secondary'>{translate('TEXT_FORMATTING_DISCLAIMER')}</AppText>
        </View>
        <AppScrollView className='mt-4 max-h-[300]'>
          <AppText className='text-text-primary'>{content || translate('TEXT_NO_PREVIEW_AVAILABLE')}</AppText>
        </AppScrollView>
      </View>
    </AppModal>
  );
};
