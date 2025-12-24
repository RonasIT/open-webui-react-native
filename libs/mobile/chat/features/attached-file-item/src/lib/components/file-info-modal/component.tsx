import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import {
  AppModal,
  AppModalProps,
  AppScrollView,
  AppText,
  Icon,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { prepareFileInfo } from '../../utils';

interface FileInfoModalProps extends AppModalProps {
  file: FileData;
}

export const FileInfoModal = ({ file, ...modalProps }: FileInfoModalProps): ReactElement => {
  const translate = useTranslation('CHAT.ATTACHED_FILE_ITEM.FILE_INFO_MODAL');

  return (
    <AppModal {...modalProps}>
      <View className='gap-4'>
        <AppText className='font-medium text-lg-sm sm:text-lg'>{file.filename}</AppText>
        <AppText className='text-text-secondary'>{prepareFileInfo(file)}</AppText>
        <View className='flex-row gap-4'>
          <Icon
            name='alert'
            className='color-text-secondary'
            width={16} />
          <AppText className='text-text-secondary'>{translate('TEXT_FORMATTING_DISCLAIMER')}</AppText>
        </View>
        <AppScrollView className='mt-4 max-h-[300]'>
          <AppText className='text-text-primary'>{file.data.content || translate('TEXT_NO_PREVIEW_AVAILABLE')}</AppText>
        </AppScrollView>
      </View>
    </AppModal>
  );
};
