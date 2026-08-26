import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useLocalSearchParams } from 'expo-router';
import { ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormChatInput, FormChatInputSchema } from '@open-webui-react-native/mobile/chat/features/form-chat-input';
import { useCreateNewChat } from '@open-webui-react-native/mobile/chat/features/use-create-new-chat';
import { useAttachedFiles } from '@open-webui-react-native/mobile/shared/features/use-attached-files';
import { useSetSelectedModel } from '@open-webui-react-native/mobile/shared/features/use-set-selected-model';
import { AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import { ChatGenerationOption, usersApi } from '@open-webui-react-native/shared/data-access/api';
import { webSocketState$ } from '@open-webui-react-native/shared/data-access/websocket';
import { AnalyticsEvent, analyticsService } from '@open-webui-react-native/shared/utils/analytics-service';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { SearchFolderView, SearchModelView } from './components';

interface CreateChatProps {
  onChatCreated: (id: string) => void;
  onCreateFolderPress: () => void;
  createFolderModalComponent: ReactElement;
}

export function CreateChat({
  onChatCreated,
  onCreateFolderPress,
  createFolderModalComponent,
}: CreateChatProps): ReactElement {
  const translate = useTranslation('CHAT.CREATE_CHAT');
  const translateChatScreen = useTranslation('CHAT.CHAT_SCREEN');
  const { folderId: existedFolderId } = useLocalSearchParams();
  const isSocketConnected = useSelector(webSocketState$.isSocketConnected);

  const { data: userSettings } = usersApi.useGetUserSettings();
  const isTemporaryChat = userSettings?.ui.temporaryChatByDefault ?? false;

  const {
    attachedFiles,
    attachedImages,
    handleFileUploaded,
    handleDeleteFile,
    handleDeleteImage,
    handleImageUploaded,
    resetAttachments,
  } = useAttachedFiles();

  const handleChatCreated = (id: string): void => {
    reset();
    resetAttachments();
    onChatCreated(id);
    analyticsService.trackEvent(AnalyticsEvent.NEW_CHAT_CREATED);
  };

  const { startChatCreation, isLoading: isCreating } = useCreateNewChat({ onSuccess: handleChatCreated });

  const { modelId, onSelectModel } = useSetSelectedModel();
  const [folderId, setFolderId] = useState<string | undefined>();

  const { control, handleSubmit, reset } = useForm<FormValues<FormChatInputSchema>>({
    defaultValues: {
      inputValue: '',
    },
  });

  const onSubmit = (options: Array<ChatGenerationOption>): Promise<void> =>
    handleSubmit(({ inputValue }: FormValues<FormChatInputSchema>): void => {
      if (!modelId) {
        return ToastService.showError(translate('TEXT_MODEL_NOT_SELECTED'));
      }

      if (options.includes(ChatGenerationOption.IMAGE_GENERATION)) {
        analyticsService.trackEvent(AnalyticsEvent.GENERATE_IMAGE_USED);
      }

      startChatCreation(inputValue, modelId, options, attachedFiles.get(), attachedImages.get(), folderId);
      analyticsService.trackEvent(AnalyticsEvent.MESSAGE_SENT, { modelId });
    })();

  useEffect(() => {
    if (existedFolderId) {
      setFolderId(existedFolderId as string);
    }
  }, [existedFolderId]);

  return (
    <View className='flex-1 bg-background-primary pt-[60px] pb-44'>
      <SearchFolderView
        selectedItemId={folderId}
        onSelectItem={setFolderId}
        onCreateFolderPress={onCreateFolderPress}
        modalComponent={createFolderModalComponent}
        disabled={!!existedFolderId}
      />
      {isTemporaryChat && (
        <View className='flex-row items-center justify-center gap-4 pb-8'>
          <Icon name='eyeClosed' className='size-8 shrink-0 color-text-secondary' />
          <AppText className='text-xs-sm sm:text-xs text-text-secondary'>
            {translateChatScreen('TEXT_TEMPORARY_CHAT')}
          </AppText>
        </View>
      )}
      <SearchModelView selectedItemId={modelId} onSelectItem={onSelectModel} />
      <FormChatInput
        placeholder={translate('TEXT_PLACEHOLDER')}
        control={control}
        name='inputValue'
        onSubmit={onSubmit}
        isLoading={isCreating || !isSocketConnected}
        isSuggestionShown={true}
        attachedFiles={attachedFiles}
        onFileUploaded={handleFileUploaded}
        onDeleteFilePress={handleDeleteFile}
        attachedImages={attachedImages}
        onImageUploaded={handleImageUploaded}
        onDeleteImagePress={handleDeleteImage}
        onChatCreated={onChatCreated}
        modelId={modelId}
      />
    </View>
  );
}
