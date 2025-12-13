import { Observable } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { xor } from 'lodash-es';
import { ReactElement, useState } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { AttachedFilesList } from '@open-webui-react-native/mobile/chat/features/attached-files-list';
import { SoundWaveRecorder } from '@open-webui-react-native/mobile/chat/features/sound-wave-recorder';
import { SuggestionsList } from '@open-webui-react-native/mobile/chat/features/suggestions-list';
import { useVoiceModeModal } from '@open-webui-react-native/mobile/chat/features/voice-mode-modal';
import {
  ImagePreviewModal,
  useImagePreview,
} from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { AppTextInput, AppInputProps, View, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  appConfigurationApi,
  ChatGenerationOption,
  ChatResponse,
  tasksApi,
  tasksService,
} from '@open-webui-react-native/shared/data-access/api';
import { AttachedImage, FileData, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { toDataUrl } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AttachmentsMenuSheet, ChatInputBottomRow, SelectOptionIcon } from './components';

interface FormChatInputProps<T extends FieldValues> extends AppInputProps {
  name: Path<T>;
  control: Control<T>;
  onSubmit: (options: Array<ChatGenerationOption>) => void;
  attachedFiles: Observable<Array<FileData>>;
  onFileUploaded: (file: FileData) => void;
  onDeleteFilePress: (id: string) => void;
  attachedImages: Observable<Array<ImageData>>;
  onImageUploaded: (image: ImageData) => void;
  onDeleteImagePress: (fileName: string) => void;
  chat?: ChatResponse;
  modelId?: string;
  onChatCreated?: (id: string) => void;
  isLoading?: boolean;
  isSuggestionShown?: boolean;
  isResponseGenerating?: boolean;
  isStopResponseEnabled?: boolean;
}

export interface FormChatInputSchema {
  inputValue: string;
}

export function FormChatInput<T extends FieldValues>({
  name,
  control,
  onSubmit,
  attachedFiles,
  onFileUploaded,
  onDeleteFilePress,
  attachedImages,
  onImageUploaded,
  onDeleteImagePress,
  chat,
  modelId,
  onChatCreated,
  isLoading,
  isSuggestionShown,
  isResponseGenerating,
  isStopResponseEnabled,
  ...restProps
}: FormChatInputProps<T>): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT');

  const { data: config } = appConfigurationApi.useGetAppConfiguration();
  const stopTaskMutation = tasksApi.useStopTask();

  const { field } = useController({ control, name });

  const files = useSelector(attachedFiles);
  const images = useSelector(attachedImages);

  const [isMicrophonePreparing, setIsMicrophonePreparing] = useState<boolean>(false);
  const [isDictateMode, setIsDictateMode] = useState<boolean>(false);

  const [options, setOptions] = useState<Array<ChatGenerationOption>>([]);

  const { handleImagePress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } = useImagePreview();
  const { present: openVoiceModeModal } = useVoiceModeModal();

  const isInputEmpty = !field.value?.trim() && files.length === 0 && images.length === 0;

  const imagesForPreview = images.map((image, index) => ({
    ...new AttachedImage({ url: toDataUrl(image.base64) }),
    index,
  }));

  const onVoiceModePress = async (): Promise<void> => {
    if (!modelId) {
      return ToastService.showError(translate('TEXT_MODEL_NOT_SELECTED'));
    }
    setIsMicrophonePreparing(true);
    await openVoiceModeModal({ chatId: chat?.id, modelId });
    setIsMicrophonePreparing(false);
  };

  const handleSuggestionPress = (suggestion: string): void => {
    field.onChange(suggestion);
  };

  const onGenerationOptionPress = (option: ChatGenerationOption): void => setOptions((state) => xor(state, [option]));

  const handleDictateModePress = withOfflineGuard(() => setIsDictateMode(true));

  const onStartRecording = (): void => {
    setIsDictateMode(true);
    field.onChange('');
  };

  const onCompleteRecording = (text: string): void => {
    setIsDictateMode(false);
    field.onChange(text);
  };

  const onStopGenerationPress = async (): Promise<void> => {
    if (!chat) return;

    const chatId = chat.id;
    const lastMessageId = chat.chat.history.currentId;

    const tasksData = await tasksService.getChatTasks(chatId);
    const taskId = tasksData?.tasksIds[0];

    if (taskId) {
      stopTaskMutation.mutate({ taskId, chatId, lastMessageId });
    }
  };

  return (
    <View>
      {isDictateMode ? (
        <SoundWaveRecorder
          isRecordingStarted={isDictateMode}
          onStartRecording={onStartRecording}
          onCompleteRecording={onCompleteRecording}
          onStopRecording={() => setIsDictateMode(false)}
        />
      ) : (
        <AppTextInput
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          maxHeight={300}
          editable={!isLoading}
          multiline
          scrollEnabled
          textClassName='text-md-sm sm:text-md'
          accessoryTop={
            <AttachedFilesList
              onDeleteFilePress={onDeleteFilePress}
              attachedFiles={attachedFiles}
              attachedImages={attachedImages}
              onDeleteImagePress={onDeleteImagePress}
              onImagePress={handleImagePress}
            />
          }
          accessoryBottom={
            <ChatInputBottomRow
              onSubmit={() => onSubmit(options)}
              isSubmitDisabled={!isFeatureEnabled(FeatureID.VOICE_MODE) && isInputEmpty}
              onVoiceModePress={onVoiceModePress}
              isVoiceModeAvailable={isFeatureEnabled(FeatureID.VOICE_MODE) && isInputEmpty}
              onStopGenerationPress={onStopGenerationPress}
              isResponseGenerating={isResponseGenerating}
              isStopResponseEnabled={isStopResponseEnabled}
              isLoading={isLoading || isMicrophonePreparing}>
              <View className='flex-row flex-1 justify-between'>
                <View className='gap-16 flex-row '>
                  <AttachmentsMenuSheet
                    onFileUploaded={onFileUploaded}
                    disabled={isLoading}
                    onImageUploaded={onImageUploaded}
                  />
                  {config?.features.enableImageGeneration && (
                    <SelectOptionIcon
                      disabled={isLoading}
                      iconName='generatedImage'
                      onPress={() => onGenerationOptionPress(ChatGenerationOption.IMAGE_GENERATION)}
                      isSelected={options.includes(ChatGenerationOption.IMAGE_GENERATION)}
                    />
                  )}
                </View>
                <IconButton
                  disabled={isLoading}
                  iconName='microphone'
                  className='p-0 mr-16'
                  onPress={handleDictateModePress}
                />
              </View>
            </ChatInputBottomRow>
          }
          {...restProps}
        />
      )}
      {isSuggestionShown && (
        <SuggestionsList
          onPress={handleSuggestionPress}
          searchText={field.value}
          containerClassName='mt-12' />
      )}
      <ImagePreviewModal
        initialIndex={selectedImageIndex}
        images={imagesForPreview}
        visible={isPreviewVisible}
        onClosePress={handleCloseImagePress}
      />
    </View>
  );
}
