import {
  FileExtension,
  fileSystemService,
} from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { ChatResponse, getChatQueryOptions } from '@open-webui-react-native/shared/data-access/api';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { getChatAsText } from '@open-webui-react-native/shared/features/get-chat-as-text';

export interface CreateChatDownloadHandlersParams {
  chatId: string;
  setFileTypeLoading: (type: FileExtension | null) => void;
}

export interface ChatDownloadHandlers {
  downloadJson: () => Promise<void>;
  downloadText: () => Promise<void>;
}

export const createChatDownloadHandlers = ({
  chatId,
  setFileTypeLoading,
}: CreateChatDownloadHandlersParams): ChatDownloadHandlers => {
  const getChat = async (): Promise<ChatResponse> => queryClient.ensureQueryData(getChatQueryOptions(chatId));

  const downloadJson = async (): Promise<void> => {
    try {
      setFileTypeLoading(FileExtension.JSON);

      const { chat } = await getChat();
      const jsonData = JSON.stringify([chat], null, 2);

      await fileSystemService.shareJsonFile(`chat-export-${Date.now()}`, jsonData);
    } finally {
      setFileTypeLoading(null);
    }
  };

  const downloadText = async (): Promise<void> => {
    try {
      setFileTypeLoading(FileExtension.TXT);

      const { chat } = await getChat();
      const text = getChatAsText(chat);

      await fileSystemService.shareTextFile(`chat-${chat.title}`, text);
    } finally {
      setFileTypeLoading(null);
    }
  };

  return {
    downloadJson,
    downloadText,
  };
};
