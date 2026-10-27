import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  FormFloatedLabelInput,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { DefaultSystemPromptFormSchema } from '../../forms';

export type DefaultSystemPromptSheetMethods = {
  present: () => void;
};

export type DefaultSystemPromptSheetRef = ForwardedRef<DefaultSystemPromptSheetMethods>;

export type DefaultSystemPromptSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  systemPrompt?: string;
  onConfirm: (systemPrompt: string) => void;
  ref?: DefaultSystemPromptSheetRef;
};

export function DefaultSystemPromptSheet({
  systemPrompt,
  onConfirm,
  ref,
  ...props
}: DefaultSystemPromptSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.DEFAULT_SYSTEM_PROMPT_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const isOfflineMode = useSelector(appState$.isOfflineMode);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: new DefaultSystemPromptFormSchema(),
  });

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        reset(new DefaultSystemPromptFormSchema({ systemPrompt }));
        sheetRef.current?.present();
      },
    }),
    [systemPrompt],
  );

  const submitForm = handleSubmit((values) => {
    onConfirm(values.systemPrompt.trim());
    closeSheet();
  });

  const handleConfirmPress = withOfflineGuard(submitForm);

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress}
            confirmButtonProps={{ isInactive: isOfflineMode }}
          />
          <AppBottomSheetKeyboardAwareScrollView>
            <View className='pt-8' style={{ paddingBottom: bottom + 24 }}>
              <FormFloatedLabelInput
                name='systemPrompt'
                control={control}
                label={translate('TEXT_LABEL')}
                textAlignVertical='top'
                multiline
                textClassName='text-md-sm sm:text-md h-[240] pt-24'
                inputRef={inputRef}
              />
            </View>
          </AppBottomSheetKeyboardAwareScrollView>
        </View>
      }
    />
  );
}
