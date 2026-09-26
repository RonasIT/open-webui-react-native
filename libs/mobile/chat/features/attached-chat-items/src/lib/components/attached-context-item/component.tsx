import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { AttachedItem, IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileType } from '@open-webui-react-native/shared/data-access/common';

type ContextAttachmentType = FileType.COLLECTION | FileType.TEXT | FileType.CHAT;

const attachmentDisplayMeta: Record<ContextAttachmentType, { iconName: IconName; translationKey: string }> = {
  [FileType.COLLECTION]: { iconName: 'database', translationKey: 'TEXT_COLLECTION' },
  [FileType.TEXT]: { iconName: 'link', translationKey: 'TEXT_WEBPAGE' },
  [FileType.CHAT]: { iconName: 'history', translationKey: 'TEXT_CHAT' },
};

interface AttachedContextItemProps {
  type: ContextAttachmentType;
  name: string;
  hasError?: boolean;
  className?: string;
  onDeletePress?: () => void;
}

export function AttachedContextItem({
  type,
  name,
  hasError,
  className,
  onDeletePress,
}: AttachedContextItemProps): ReactElement {
  const translate = useTranslation('CHAT.ATTACHED_CHAT_ITEMS.ATTACHED_CONTEXT_ITEM');
  const { iconName, translationKey } = attachmentDisplayMeta[type];

  return (
    <AttachedItem
      disabled
      title={name}
      subTitle={translate(hasError ? 'TEXT_WEBPAGE_ERROR' : translationKey)}
      iconName={iconName}
      hasError={hasError}
      className={className}
      onDeletePress={onDeletePress}
    />
  );
}
