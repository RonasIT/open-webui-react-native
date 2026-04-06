import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { FileExtension } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { createChatDownloadHandlers } from '@open-webui-react-native/mobile/shared/features/download-chat';
import { ActionsBottomSheet, ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface DownloadChatOptionsSheetProps {
  chatId: string;
  ref?: React.RefObject<BottomSheetModal | null>;
}

export function DownloadChatOptionsSheet({ chatId, ref }: DownloadChatOptionsSheetProps): ReactElement {
  const translate = useTranslation('SHARED.CHAT_ACTIONS_MENU_SHEET.DOWNLOAD_CHAT_OPTIONS_SHEET');

  const [fileTypeLoading, setFileTypeLoading] = useState<
    FileExtension.JSON | FileExtension.TXT | FileExtension.PDF | null
  >(null);

  const { downloadJson, downloadText } = createChatDownloadHandlers({
    chatId,
    setFileTypeLoading,
  });

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_EXPORT_CHAT_JSON'),
      iconName: 'jsonFile',
      onPress: downloadJson,
      disabled: !!fileTypeLoading,
      isLoading: fileTypeLoading === FileExtension.JSON,
    },
    {
      title: translate('TEXT_PLAIN_TEXT'),
      iconName: 'txtFile',
      onPress: downloadText,
      disabled: !!fileTypeLoading,
      isLoading: fileTypeLoading === FileExtension.TXT,
    },
  ];

  return <ActionsBottomSheet ref={ref} actions={actions} />;
}
