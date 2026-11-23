import { useState } from 'react';
import {
  appConfigurationApi,
  chatApi,
  isModelSelectable,
  isTemporaryChatId,
  modelsApi,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';

const firstPresentId = (ids: Array<string | null | undefined>): string | undefined => {
  for (const id of ids) {
    const trimmed = id?.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
};

export interface UseSetSelectedModelResult {
  isLoading: boolean;
  onSelectModel: (id: string) => void;
  modelId?: string;
  modelName?: string;
}

export const useSetSelectedModel = (chatId?: string): UseSetSelectedModelResult => {
  const [pickedModelIds, setPickedModelIds] = useState<Record<string, string>>({});
  const pickKey = chatId ?? '';
  const pickedModelId = pickedModelIds[pickKey];

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

  // NOTE: An explicit id stays selected when it has left the list, so the screen can say it is
  // unavailable instead of silently sending the next model. Only a chat with no explicit model
  // falls through, and that fallback skips models the picker hides.
  const explicitModelId = firstPresentId([
    chatId ? chat?.chat.models?.[0] : undefined,
    settings?.ui.models?.[0],
    ...(config?.defaultModels?.split(',') ?? []),
  ]);
  const modelId = !isDataReceived
    ? undefined
    : (pickedModelId ?? explicitModelId ?? (models?.find(isModelSelectable) ?? models?.[0])?.id);

  const onSelectModel = (id: string): void => {
    setPickedModelIds((current) => ({ ...current, [pickKey]: id }));
  };

  return {
    isLoading,
    onSelectModel,
    modelId,
    modelName: models?.find((model) => model.id === modelId)?.name ?? modelId,
  };
};
