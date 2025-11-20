import { useEffect, useMemo, useState } from 'react';
import {
  appConfigurationApi,
  chatApi,
  modelsApi,
  usersApi,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

export interface UseSetSelectedModelResult {
  isLoading: boolean;
  onSelectModel: (id: string) => void;
  modelId?: string;
  modelName?: string;
}

export const useSetSelectedModel = (chatId?: string): UseSetSelectedModelResult => {
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  const { data: settings, isSuccess: isSettingsSuccess, isLoading: isSettingsLoading } = usersApi.useGetUserSettings();
  const {
    data: config,
    isSuccess: isConfigSuccess,
    isLoading: isConfigLoading,
  } = appConfigurationApi.useGetAppConfiguration();
  const { data: models, isSuccess: isModelsSuccess, isLoading: isModelsLoading } = modelsApi.useGetModels();
  const {
    data: chat,
    isSuccess: isChatSuccess,
    isLoading: isChatLoading,
  } = chatApi.useGet(chatId as string, { enabled: !!chatId });

  const isDataReceived = isSettingsSuccess && isConfigSuccess && isModelsSuccess && (!chatId || isChatSuccess);

  const isLoading = isSettingsLoading || isConfigLoading || isModelsLoading || isChatLoading;

  const defaultModelId = useMemo(() => {
    if (!isDataReceived || !models?.length) {
      return undefined;
    }

    const modelCandidatesIds = [
      chatId && chat?.chat.models?.[0],
      settings?.ui.models?.[0],
      ...(config?.defaultModels?.split(',') ?? []),
      models[0].id,
    ].filter(Boolean);

    for (const candidateId of modelCandidatesIds) {
      const model = models.find((model) => model.id === candidateId);

      if (model) {
        return model.id;
      }
    }
  }, [isDataReceived, chatId, models, chat?.chat.models, settings?.ui?.models, config?.defaultModels]);

  useEffect(() => {
    if (defaultModelId) {
      setModelId(defaultModelId);
    }
  }, [defaultModelId]);

  return {
    isLoading,
    onSelectModel: setModelId,
    modelId,
    modelName: models?.find((model) => model.id === modelId)?.name,
  };
};
