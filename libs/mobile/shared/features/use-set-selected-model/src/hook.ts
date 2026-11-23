import { useEffect, useMemo, useState } from 'react';
import {
  appConfigurationApi,
  chatApi,
  isModelSelectable,
  isTemporaryChatId,
  modelsApi,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';

export interface UseSetSelectedModelResult {
  isLoading: boolean;
  onSelectModel: (id: string) => void;
  modelId?: string;
  modelName?: string;
}

export const useSetSelectedModel = (chatId?: string): UseSetSelectedModelResult => {
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  const {
    data: settings,
    isSuccess: isSettingsSuccess,
    isLoading: isSettingsLoading,
    isFetched: isSettingsFetched,
  } = usersApi.useGetUserSettings();
  const {
    data: config,
    isSuccess: isConfigSuccess,
    isLoading: isConfigLoading,
    isFetched: isConfigFetched,
  } = appConfigurationApi.useGetAppConfiguration();
  const {
    data: models,
    isSuccess: isModelsSuccess,
    isLoading: isModelsLoading,
    isFetched: isModelsFetched,
  } = modelsApi.useGetModels();
  const isTemporaryChat = isTemporaryChatId(chatId);
  const {
    data: chat,
    isSuccess: isChatSuccess,
    isLoading: isChatLoading,
    isFetched: isChatFetched,
  } = chatApi.useGet(chatId as string, { enabled: !!chatId && !isTemporaryChat });

  // NOTE: Temporary chats are never persisted, so their useGet query is disabled above (it can't
  // succeed) — the seeded cache value it still returns is enough, don't wait on isChatSuccess for it.
  const isDataReceived =
    isSettingsSuccess && isConfigSuccess && isModelsSuccess && (!chatId || isTemporaryChat || isChatSuccess);

  // NOTE: As in useInitRequests, only the first fetch blocks the screen: without data a refetch goes back
  // to `pending` and would keep the spinner on every retry cycle.
  const isLoading =
    (isSettingsLoading && !isSettingsFetched) ||
    (isConfigLoading && !isConfigFetched) ||
    (isModelsLoading && !isModelsFetched) ||
    (isChatLoading && !isChatFetched);

  const defaultModelId = useMemo(() => {
    if (!isDataReceived || !models?.length) {
      return undefined;
    }

    const explicitId = [
      chatId ? chat?.chat.models?.[0] : undefined,
      settings?.ui.models?.[0],
      ...(config?.defaultModels?.split(',') ?? []),
    ]
      .map((id) => id?.trim())
      .find(Boolean);

    // NOTE: An explicit id that has left the list stays empty, so the header asks for a model
    // instead of starting on the next one. With no explicit id, keep the first model the picker offers.
    if (explicitId) {
      return models.some((model) => model.id === explicitId) ? explicitId : undefined;
    }

    return (models.find(isModelSelectable) ?? models[0]).id;
  }, [isDataReceived, chatId, models, chat?.chat.models, settings?.ui?.models, config?.defaultModels]);

  useEffect(() => {
    setModelId(defaultModelId);
  }, [defaultModelId]);

  return {
    isLoading,
    onSelectModel: setModelId,
    modelId,
    modelName: models?.find((model) => model.id === modelId)?.name,
  };
};
