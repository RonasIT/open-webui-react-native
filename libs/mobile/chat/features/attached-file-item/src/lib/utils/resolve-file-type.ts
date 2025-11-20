import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { last, split, toLower } from 'lodash-es';
import { FileData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

export function resolveFileType(file: FileData): string {
  const contentType = toLower(file.meta.contentType || '');
  const ext = toLower(last(split(file.filename, '.')) || '');

  const documentExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
  const collectionExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (
    contentType.startsWith('application/pdf') ||
    contentType.startsWith('application/msword') ||
    contentType.includes('spreadsheet') ||
    documentExts.includes(ext)
  ) {
    return i18n.t('CHAT.ATTACHED_FILE_ITEM.TEXT_DOCUMENT');
  }

  if (contentType.includes('zip') || contentType.includes('tar') || collectionExts.includes(ext)) {
    return i18n.t('CHAT.ATTACHED_FILE_ITEM.TEXT_COLLECTION');
  }

  return i18n.t('CHAT.ATTACHED_FILE_ITEM.TEXT_FILE');
}
