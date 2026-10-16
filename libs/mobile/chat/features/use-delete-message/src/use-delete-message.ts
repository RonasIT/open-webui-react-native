import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import {
  Chat,
  chatApi,
  chatQueriesKeys,
  ChatResponse,
  createMessagesList,
  deleteMessageFromHistory,
  isTemporaryChatId,
} from '@open-webui-react-native/shared/data-access/api';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { alertService } from '@open-webui-react-native/shared/utils/alert-service';

interface UseDeleteMessageArgs {
  chatId: string;
  onDeleted: () => void;
}

export function useDeleteMessage({ chatId, onDeleted }: UseDeleteMessageArgs): typeof result {
  const translate = useTranslation('CHAT.USE_DELETE_MESSAGE');

  const { mutate: deleteChatMessage, isPending: isDeleting } = chatApi.useDeleteMessage();

  // NOTE: Temporary chats are never persisted, so the message is deleted from the cache only.
  const deleteTemporaryChatMessage = (messageId: string): void => {
    queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey, (draft) => {
      if (!draft) return draft;

      const history = deleteMessageFromHistory(draft.chat.history, messageId);
      const messages = createMessagesList(history, history.currentId);

      return new ChatResponse({ ...draft, chat: new Chat({ ...draft.chat, history, messages }) });
    });
    onDeleted();
  };

  const handleConfirmDelete = (messageId: string): void => {
    if (isTemporaryChatId(chatId)) {
      return deleteTemporaryChatMessage(messageId);
    }

    deleteChatMessage({ chatId, messageId }, { onSuccess: onDeleted });
  };

  const deleteMessage = (messageId: string): void => {
    alertService.confirm({
      title: translate('TEXT_DELETE_MESSAGE'),
      message: translate('TEXT_CANNOT_BE_UNDONE'),
      confirmButtonText: translate('BUTTON_DELETE'),
      confirmButtonStyle: 'destructive',
      onConfirm: () => handleConfirmDelete(messageId),
    });
  };

  const result = {
    deleteMessage,
    isDeleting,
  };

  return result;
}
