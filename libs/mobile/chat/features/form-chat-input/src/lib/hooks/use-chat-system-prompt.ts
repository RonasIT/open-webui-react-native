import { useSelector } from '@legendapp/state/react';
import {
  Chat,
  chatApi,
  ChatResponse,
  chatSystemPromptState$,
  isTemporaryChatId,
  NEW_CHAT_SYSTEM_PROMPT_KEY,
  patchChatQueryData,
} from '@open-webui-react-native/shared/data-access/api';

export interface UseChatSystemPromptArgs {
  chat?: ChatResponse;
}

export interface UseChatSystemPromptResult {
  systemPrompt: string;
  saveSystemPrompt: (value: string) => void;
}

export function useChatSystemPrompt({ chat }: UseChatSystemPromptArgs): UseChatSystemPromptResult {
  const { mutate: updateChat } = chatApi.useUpdate();

  const newChatSystemPrompt = useSelector(chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY]);
  const systemPrompt = chat ? (chat.chat.params?.system as string | undefined) || '' : newChatSystemPrompt || '';

  const saveSystemPrompt = (value: string): void => {
    const trimmedValue = value.trim();

    if (!chat) {
      if (trimmedValue) {
        chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY].set(trimmedValue);
      } else {
        chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY].delete();
      }

      return;
    }

    const nextChat = { params: { ...chat.chat.params, system: trimmedValue } } as Partial<Chat> as Chat;

    if (isTemporaryChatId(chat.id)) {
      patchChatQueryData(chat.id, { chat: nextChat });
    } else {
      updateChat({ id: chat.id, chat: nextChat });
    }
  };

  return { systemPrompt, saveSystemPrompt };
}
