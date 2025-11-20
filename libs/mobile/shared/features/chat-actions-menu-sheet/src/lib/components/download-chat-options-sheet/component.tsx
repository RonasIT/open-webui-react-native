import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import {
  FileExtension,
  fileSystemService,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/file-system-service';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { chatQueriesKeys, ChatResponse } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { getChatAsText } from '@open-web-ui-mobile-client-react-native/shared/features/get-chat-as-text';

export interface DownloadChatOptionsSheetProps {
  chatId: string;
  ref?: React.RefObject<BottomSheetModal | null>;
}

export function DownloadChatOptionsSheet({ chatId, ref }: DownloadChatOptionsSheetProps): ReactElement {
  const translate = useTranslation('SHARED.CHAT_ACTIONS_MENU_SHEET.DOWNLOAD_CHAT_OPTIONS_SHEET');

  const [fileTypeLoading, setFileTypeLoading] = useState<
    FileExtension.JSON | FileExtension.TXT | FileExtension.PDF | null
  >(null);

  const getChat = async (): Promise<ChatResponse> =>
    await queryClient.fetchQuery<ChatResponse>({ queryKey: chatQueriesKeys.get(chatId).queryKey });

  const onDownloadText = async (): Promise<void> => {
    setFileTypeLoading(FileExtension.TXT);
    const { chat } = await getChat();
    const text = getChatAsText(chat);
    await fileSystemService.shareTextFile(`chat-${chat.title}`, text);
    setFileTypeLoading(null);
  };

  const onDownloadJson = async (): Promise<void> => {
    setFileTypeLoading(FileExtension.JSON);
    const { chat } = await getChat();
    const jsonData = JSON.stringify([chat], null, 2);
    await fileSystemService.shareJsonFile(`chat-export-${Date.now()}`, jsonData);
    setFileTypeLoading(null);
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_EXPORT_CHAT_JSON'),
      iconName: 'jsonFile',
      onPress: onDownloadJson,
      disabled: !!fileTypeLoading,
      isLoading: fileTypeLoading === FileExtension.JSON,
    },
    {
      title: translate('TEXT_PLAIN_TEXT'),
      iconName: 'txtFile',
      onPress: onDownloadText,
      disabled: !!fileTypeLoading,
      isLoading: fileTypeLoading === FileExtension.TXT,
    },
  ];

  return <ActionsBottomSheet ref={ref} actions={actions} />;
}
