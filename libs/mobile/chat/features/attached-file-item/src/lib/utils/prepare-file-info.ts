import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { getLineCount } from '@open-webui-react-native/shared/utils/strings';
import { formatFileSize } from './format-file-size';

export const prepareFileInfo = (file: FileData): string => {
  return `${formatFileSize(file.meta.size)} • ${i18n.t('CHAT.ATTACHED_FILE_ITEM.FILE_INFO_MODAL.TEXT_EXTRACTED_LINES', { count: getLineCount(file.data.content) })}`;
};
