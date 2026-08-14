import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import Constants from 'expo-constants';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { useAttachedFiles } from '@open-webui-react-native/mobile/shared/features/use-attached-files';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  AppButton,
  FormFloatedLabelInput,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appConfigurationApi, authApi, supabaseApi } from '@open-webui-react-native/shared/data-access/api';
import { ImageData } from '@open-webui-react-native/shared/data-access/common';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { AttachmentRow } from './components';
import { ContactSupportFormSchema } from './forms';

export type ContactSupportSheetMethods = {
  present: () => void;
};

export type ContactSupportSheetRef = ForwardedRef<ContactSupportSheetMethods>;

export type ContactSupportSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  ref?: ContactSupportSheetRef;
};

export function ContactSupportSheet({ ref, ...props }: ContactSupportSheetProps): ReactElement {
  const translate = useTranslation('SHARED.CONTACT_SUPPORT_SHEET');
  const { bottom } = useSafeAreaInsets();

  const sheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);

  const { data: profile } = authApi.useGetProfile();
  const { data: configuration } = appConfigurationApi.useGetAppConfiguration();
  const { mutateAsync: submitFeedback, isPending } = supabaseApi.useSubmitFeedback();

  const { attachedImages, handleImageUploaded, handleDeleteImage, resetAttachments } = useAttachedFiles();

  const images = useSelector(attachedImages).flatMap((image) => (image ? [image] : []));

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new ContactSupportFormSchema(),
    resolver: yupResolver(ContactSupportFormSchema.validationSchema),
  });

  const closeModal = (): void => sheetRef.current?.close();

  const openModal = (): void => sheetRef.current?.present();

  const handleOpen = (): void => inputRef.current?.focus();

  const handlePickImage = async (): Promise<void> => {
    const image = await imagePickerService.getImage(ImagePickerSource.GALLERY);
    const asset = image?.assets?.[0];

    if (!asset || !asset.base64) {
      return;
    }

    handleImageUploaded({
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType,
      fileName: asset.fileName || undefined,
    });
  };

  const onSubmit = async ({ message }: ContactSupportFormSchema): Promise<void> => {
    try {
      await submitFeedback({
        message,
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version,
        apiVersion: configuration?.version,
        userId: profile?.id,
        attachments: images,
      });

      closeModal();
      reset(new ContactSupportFormSchema());
      resetAttachments();
      ToastService.showSuccess(translate('TEXT_MESSAGE_SENT'));
    } catch {
      ToastService.showError();
    }
  };

  useImperativeHandle(ref, () => {
    return {
      present: openModal,
    };
  }, []);

  const renderAttachment = (image: ImageData, index: number): ReactElement => (
    <AttachmentRow
      key={index}
      attachment={image}
      onRemove={() => handleDeleteImage(image.uri)} />
  );

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
            title={translate('TEXT_REPORT_BUG')}
            onGoBack={closeModal}
            onConfirmPress={handleSubmit(onSubmit)}
            confirmButtonProps={{ isLoading: isPending }}
          />
          <AppBottomSheetKeyboardAwareScrollView>
            <View className='pt-8 gap-16 flex-1 bg-background-primary' style={{ paddingBottom: bottom + 24 }}>
              <FormFloatedLabelInput
                control={control}
                name='message'
                textAlignVertical='top'
                multiline
                textClassName='text-md-sm sm:text-md h-[160] pt-24'
                label={translate('TEXT_YOUR_MESSAGE')}
                inputRef={inputRef}
              />
              {images.map(renderAttachment)}
              <AppButton
                variant='outline'
                size='sm'
                text={translate('BUTTON_ATTACH_SCREENSHOTS_OR_VIDEO')}
                iconName='attachment'
                onPress={handlePickImage}
              />
            </View>
          </AppBottomSheetKeyboardAwareScrollView>
        </View>
      }
    />
  );
}
