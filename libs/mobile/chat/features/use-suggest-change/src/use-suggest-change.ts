import dayjs from 'dayjs';
import { useState } from 'react';
import { Control, useForm, UseFormHandleSubmit } from 'react-hook-form';
import uuid from 'react-native-uuid';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import {
  chatApi,
  ChatResponse,
  Message,
  prepareRegeneratePayload,
  createMessagesList,
  patchChatWithSelectedMessages,
} from '@open-webui-react-native/shared/data-access/api';
import { Role } from '@open-webui-react-native/shared/data-access/common';

export interface SuggestChangeSchema {
  suggestionInputValue: string;
}

interface UseSuggestChangeProps {
  chat?: ChatResponse;
  modelId?: string;
}

export interface UseSuggestChangeReturn {
  suggestingMessageId?: string;
  control: Control<FormValues<SuggestChangeSchema>>;
  handleSubmit: UseFormHandleSubmit<FormValues<SuggestChangeSchema>>;
  startSuggesting: (messageId: string) => void;
  cancelSuggesting: () => void;
  submitSuggestion: (message: string) => Promise<void>;
  regenerateWithSuggestion: (messageId: string, message: string) => Promise<void>;
}

export const useSuggestChange = ({ chat, modelId }: UseSuggestChangeProps): UseSuggestChangeReturn => {
  const [suggestingMessageId, setSuggestingMessageId] = useState<string>();

  const { control, handleSubmit, reset } = useForm<FormValues<SuggestChangeSchema>>({
    defaultValues: { suggestionInputValue: '' },
  });

  const { mutate: completeChat } = chatApi.useCompleteChat();

  const startSuggesting = (messageId: string): void => {
    setSuggestingMessageId(messageId);
    reset({ suggestionInputValue: '' });
  };

  const cancelSuggesting = (): void => {
    setSuggestingMessageId(undefined);
    reset({ suggestionInputValue: '' });
  };

  const regenerateForMessage = async (messageId: string, message: string): Promise<void> => {
    if (!chat?.chat || !modelId) return;

    const history = chat.chat.history;
    const baseAssistant = history.messages[messageId];
    const parentUserId = baseAssistant.parentId!;
    const newAssistantId = uuid.v4();
    const now = dayjs();
    const timestampSec = Math.floor(now.unix());

    history.messages[newAssistantId] = new Message({
      id: newAssistantId,
      timestamp: timestampSec,
      parentId: parentUserId,
      role: Role.ASSISTANT,
      content: '',
      model: modelId,
      modelName: modelId,
      childrenIds: [],
    });

    history.messages[parentUserId].childrenIds?.push(newAssistantId);
    history.currentId = newAssistantId;

    const newMessagesList = createMessagesList(history, newAssistantId);
    patchChatWithSelectedMessages(chat.id, newAssistantId, newMessagesList);

    const payload = prepareRegeneratePayload({
      chat,
      messageId: newAssistantId,
      model: modelId,
      suggestionPrompt: message,
    });

    completeChat(payload);
    cancelSuggesting();
  };

  const submitSuggestion = async (message: string): Promise<void> => {
    if (!suggestingMessageId) return;
    await regenerateForMessage(suggestingMessageId, message);
  };

  const regenerateWithSuggestion = async (messageId: string, message: string): Promise<void> =>
    regenerateForMessage(messageId, message);

  return {
    suggestingMessageId,
    control,
    handleSubmit,
    startSuggesting,
    cancelSuggesting,
    submitSuggestion,
    regenerateWithSuggestion,
  };
};
