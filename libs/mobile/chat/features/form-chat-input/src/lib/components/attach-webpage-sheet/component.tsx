import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  AppBottomSheet,
  AppText,
  BottomSheetTextInput,
  BottomSheetTextInputRef,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { uiState$ } from '@open-webui-react-native/mobile/shared/ui/ui-state';
import {
  createAttachedWebpage,
  createFailedAttachedWebpage,
  parseWebpageUrls,
  ProcessUrlRequest,
  ProcessUrlType,
  retrievalApi,
} from '@open-webui-react-native/shared/data-access/api';
import { AttachedListItem, FileType } from '@open-webui-react-native/shared/data-access/common';
import { AttachWebpageFormSchema } from './forms';

export type AttachWebpageSheetMethods = {
  present: () => void;
};

export type AttachWebpageSheetRef = ForwardedRef<AttachWebpageSheetMethods>;

export interface AttachWebpageSheetProps {
  ref?: AttachWebpageSheetRef;
  onItemAttached: (item: AttachedListItem) => void;
}

export function AttachWebpageSheet({ ref, onItemAttached }: AttachWebpageSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.ATTACH_WEBPAGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<BottomSheetTextInputRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: processUrl } = retrievalApi.useProcessUrl();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new AttachWebpageFormSchema(),
    resolver: yupResolver(AttachWebpageFormSchema.validationSchema),
  });

  const closeSheet = (): void => {
    sheetRef.current?.close();
  };

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        reset(new AttachWebpageFormSchema());
        sheetRef.current?.present();
      },
    }),
    [],
  );

  const handleOpen = (): void => {
    inputRef.current?.focus();
  };

  const handleConfirmPress = handleSubmit(async ({ url }) => {
    if (isSubmitting) {
      return;
    }

    const urls = parseWebpageUrls(url);

    if (urls.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      for (const webpageUrl of urls) {
        try {
          const response = await processUrl(new ProcessUrlRequest({ url: webpageUrl }));

          if ((response.type === ProcessUrlType.FILE || response.type === ProcessUrlType.IMAGE) && response.file) {
            onItemAttached({ kind: FileType.FILE, file: response.file });
          } else {
            onItemAttached({ kind: FileType.TEXT, webpage: createAttachedWebpage(response) });
          }
        } catch {
          // NOTE: one URL failing (404, timeout, …) shouldn't stop the rest of the batch —
          // the failed one becomes a removable error chip instead (see AttachedChatItems).
          onItemAttached({ kind: FileType.TEXT, webpage: createFailedAttachedWebpage(webpageUrl) });
        }
      }

      closeSheet();
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AppBottomSheet
      isModal
      ref={sheetRef}
      onOpen={handleOpen}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
      content={
        <View className='gap-16'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress}
            confirmButtonProps={{ isLoading: isSubmitting, disabled: isSubmitting }}
          />
          <View className='gap-8'>
            <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate('TEXT_WEBPAGE_URLS')}</AppText>
            <Controller
              name='url'
              control={control}
              render={({ field, fieldState }) => (
                <View className='gap-4'>
                  <BottomSheetTextInput
                    ref={inputRef}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={() => {
                      field.onBlur();
                      uiState$.isBottomSheetInputFocused.set(false);
                    }}
                    onFocus={() => uiState$.isBottomSheetInputFocused.set(true)}
                    placeholder='https://example.com'
                    autoCapitalize='none'
                    autoCorrect={false}
                    multiline
                    numberOfLines={3}
                    editable={!isSubmitting}
                    textClassName='min-h-[72px]'
                  />
                  {!!fieldState.error?.message && (
                    <AppText className='text-sm-sm sm:text-sm text-status-danger'>{fieldState.error.message}</AppText>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      }
    />
  );
}
