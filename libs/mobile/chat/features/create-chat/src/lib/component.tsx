import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useLocalSearchParams } from 'expo-router';
import { ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FormChatInput,
  FormChatInputSchema,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/features/form-chat-input';
import { useCreateNewChat } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-create-new-chat';
import { useAttachedFiles } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-attached-files';
import { useSetSelectedModel } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-set-selected-model';
import { View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/form';
import { ChatGenerationOption } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { webSocketState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';
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
  const { folderId: existedFolderId } = useLocalSearchParams();
  const isSocketConnected = useSelector(webSocketState$.isSocketConnected);

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

      startChatCreation(inputValue, modelId, options, attachedFiles.get(), attachedImages.get(), folderId);
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
