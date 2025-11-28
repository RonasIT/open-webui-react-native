import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SelectKnowledgeSheet,
  SelectKnowledgeSheetMethods,
} from '@open-webui-react-native/mobile/folder/features/select-knowledge-sheet';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { useAttachedFiles } from '@open-webui-react-native/mobile/shared/features/use-attached-files';
import {
  View,
  FormFloatedLabelInput,
  AppText,
  AppButton,
  SheetHeader,
  AppBottomSheet,
  AppBottomSheetPropsType,
  AppBottomSheetKeyboardAwareScrollView,
  AppSpinner,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import {
  filesApi,
  foldersApi,
  Knowledge,
  prepareCreateFolderPayload,
} from '@open-webui-react-native/shared/data-access/api';
import { AttachedFile, FileData } from '@open-webui-react-native/shared/data-access/common';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { getDocumentFormData } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AttachedKnowledge } from './components';
import { UpsertFolderFormSchema } from './forms';

export type UpsertFolderSheetMethods = {
  present: (id?: string) => void;
};

export type UpsertFolderSheetRef = ForwardedRef<UpsertFolderSheetMethods>;

export type UpsertFolderSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  ref?: UpsertFolderSheetRef;
};

export function UpsertFolderSheet({ ref, ...props }: UpsertFolderSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.UPSERT_FOLDER_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const nameInputRef = useRef<TextInput>(null);
  const selectKnowledgeSheetRef = useRef<SelectKnowledgeSheetMethods>(null);

  const [folderId, setFolderId] = useState<string | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<Array<Knowledge>>([]);

  const {
    mutate: uploadFile,
    isPending: isFileUploading,
    isSuccess: isFileUploaded,
    data: file,
  } = filesApi.useUploadFile();
  const { mutateAsync: createFolder, isPending: isFolderCreating } = foldersApi.useCreateFolder();
  const { mutateAsync: updateFolder, isPending: isFolderUpdating } = foldersApi.useUpdateFolder();
  const { data: folder, isLoading: isFolderLoading } = foldersApi.useGetFolder(folderId as string, {
    enabled: !!folderId,
  });
  const { attachedFiles, handleFileUploaded, handleDeleteFile, resetAttachments } = useAttachedFiles();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new UpsertFolderFormSchema(),
    resolver: yupResolver(UpsertFolderFormSchema.validationSchema),
  });

  useEffect(() => {
    if (folder) {
      reset({ name: folder.name, systemPrompt: folder.data?.systemPrompt });
      resetKnowledge();

      folder.data.files?.forEach((file) => {
        if (file instanceof AttachedFile) {
          handleFileUploaded(file.file);
        } else {
          setSelectedKnowledge((prev) => [...prev, file]);
        }
      });
    }
  }, [folder]);

  const files = useSelector(attachedFiles);

  const closeModal = (): void => sheetRef.current?.close();

  const openModal = (): void => sheetRef.current?.present();

  const handleOpen = (): void => nameInputRef.current?.focus(); //NOTE: Autofocus causes scrolling to an incorrect position

  const resetKnowledge = (): void => {
    resetAttachments();
    setSelectedKnowledge([]);
  };

  const present = (id?: string): void => {
    if (id) {
      setFolderId(id);
    }
    openModal();
  };

  useImperativeHandle(ref, () => {
    return {
      present,
    };
  }, []);

  const handleSelectKnowledgePress = (): void => selectKnowledgeSheetRef.current?.present(selectedKnowledge);

  const onSubmit = async (form: FormValues<UpsertFolderFormSchema>): Promise<void> => {
    const payload = prepareCreateFolderPayload({
      name: form.name,
      systemPrompt: form.systemPrompt,
      attachedFiles: files,
      attachedKnowledge: selectedKnowledge,
    });

    if (folderId) {
      await updateFolder({
        id: folderId,
        ...payload,
      });
    } else {
      await createFolder(payload);
    }
    closeModal();
    resetKnowledge();
    reset(new UpsertFolderFormSchema());
  };

  const handleUploadFilesPress = async (): Promise<void> => {
    const { assets } = await fileSystemService.pickFile({ multiple: false });

    if (!assets) {
      return;
    }

    const file = assets?.[0];

    if (file.size === 0) {
      ToastService.showError(translate('TEXT_YOU_CANNOT_UPLOAD_EMPTY_FILE'));

      return;
    }

    if (file.mimeType && file.mimeType.startsWith('image/')) {
      ToastService.showError(translate('TEXT_UNSUPPORTED_TYPE'));

      return;
    }

    uploadFile(getDocumentFormData(file));
  };

  useEffect(() => {
    if (isFileUploaded) {
      handleFileUploaded?.(file);
    }
  }, [isFileUploaded]);

  const renderKnowledgeItem = (item: Knowledge | FileData, index: number): ReactElement => {
    const isFile = item instanceof FileData;
    const title = isFile ? item.filename : item.name;
    const subTitle = isFile
      ? translate('TEXT_FILE')
      : item.isDocument
        ? translate('TEXT_DOCUMENT')
        : translate('TEXT_COLLECTION');

    return (
      <AttachedKnowledge
        index={index}
        disabled
        title={title}
        key={`${title}-${index}`}
        subTitle={subTitle}
        iconName={isFile || item.isDocument ? 'file' : 'database'}
        onDeletePress={() =>
          isFile
            ? handleDeleteFile(item.id)
            : setSelectedKnowledge((prev) => prev.filter((knowledge) => knowledge.id !== item.id))
        }
      />
    );
  };

  return (
    <AppBottomSheet
      {...props}
      isModal={true}
      onOpen={handleOpen}
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={folderId ? translate('TEXT_EDIT_FOLDER') : translate('TEXT_NEW_FOLDER')}
            onGoBack={closeModal}
            onConfirmPress={handleSubmit(onSubmit)}
            confirmButtonProps={{ isLoading: isFolderCreating || isFolderUpdating }}
          />
          {isFolderLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetKeyboardAwareScrollView>
              <View className='pt-8 gap-16 flex-1 bg-background-primary' style={{ paddingBottom: bottom + 24 }}>
                <FormFloatedLabelInput
                  name='name'
                  control={control}
                  label={translate('TEXT_FOLDER_NAME')}
                  placeholder={translate('TEXT_FOLDER_NAME_PLACEHOLDER')}
                  inputRef={nameInputRef}
                />
                <FormFloatedLabelInput
                  control={control}
                  name='systemPrompt'
                  textAlignVertical='top'
                  multiline
                  textClassName='text-md-sm sm:text-md h-[160] pt-24'
                  label={translate('TEXT_SYSTEM_PROMPT')}
                />
                <View className='gap-12'>
                  <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_KNOWLEDGE')}</AppText>
                  {[...(files || []), ...(selectedKnowledge || [])].map(renderKnowledgeItem)}
                  <View className='gap-8'>
                    {isFeatureEnabled(FeatureID.KNOWLEDGE) && (
                      <AppButton
                        variant='outline'
                        size='sm'
                        text={translate('BUTTON_SELECT_KNOWLEDGE')}
                        onPress={handleSelectKnowledgePress}
                      />
                    )}
                    <AppButton
                      isLoading={isFileUploading}
                      variant='outline'
                      size='sm'
                      text={translate('BUTTON_UPLOAD_FILES')}
                      onPress={handleUploadFilesPress}
                    />
                  </View>
                </View>
              </View>
            </AppBottomSheetKeyboardAwareScrollView>
          )}
          <SelectKnowledgeSheet ref={selectKnowledgeSheetRef} onConfirm={setSelectedKnowledge} />
        </View>
      }
    />
  );
}
