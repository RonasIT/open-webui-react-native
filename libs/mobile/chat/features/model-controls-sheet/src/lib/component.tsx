import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { isEqual, omit } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import {
  AppBottomSheet,
  AppBottomSheetFlashList,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AIModel,
  ModelControl,
  buildUserSettingsWithModelControlChoices,
  getModelControlChoices,
  ModelControlChoices,
  splitStaleModelControlChoices,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ModelControlMenuSheet, ModelControlMenuSheetMethods, ModelControlRow } from './components';

export type ModelControlsSheetMethods = {
  present: () => void;
};

export type ModelControlsSheetRef = ForwardedRef<ModelControlsSheetMethods>;

export interface ModelControlsSheetProps {
  ref?: ModelControlsSheetRef;
  model?: AIModel;
  onClose?: () => void;
}

export function ModelControlsSheet({ ref, model, onClose }: ModelControlsSheetProps): ReactElement {
  const translate = useTranslation('CHAT.MODEL_CONTROLS_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const menuSheetRef = useRef<ModelControlMenuSheetMethods>(null);
  const isDraftTouchedRef = useRef(false);

  const { data: userSettings, refetch } = usersApi.useGetUserSettings();
  const { mutate: updateUserSettings } = usersApi.useUpdateUserSettings();

  const [draftChoices, setDraftChoices] = useState<ModelControlChoices>({});

  const modelControls = model?.info?.params?.modelControls ?? {};

  const closeSheet = (): void => {
    sheetRef.current?.close();
  };

  const updateDraft = (updater: (current: ModelControlChoices) => ModelControlChoices): void => {
    isDraftTouchedRef.current = true;
    setDraftChoices(updater);
  };

  useImperativeHandle(
    ref,
    () => ({
      present: async (): Promise<void> => {
        if (!model) {
          return;
        }

        setDraftChoices(getModelControlChoices(userSettings, model.id));
        isDraftTouchedRef.current = false;
        sheetRef.current?.present();

        //NOTE: The web app may have changed the choice: take it unless the draft is already edited.
        const { data } = await refetch();

        if (data && !isDraftTouchedRef.current) {
          setDraftChoices(getModelControlChoices(data, model.id));
        }
      },
    }),
    [model, userSettings, refetch],
  );

  const handleConfirmPress = (): void => {
    closeSheet();

    if (!model || isEqual(draftChoices, getModelControlChoices(userSettings, model.id))) {
      return;
    }

    const { validChoices } = splitStaleModelControlChoices(model, draftChoices);

    updateUserSettings(buildUserSettingsWithModelControlChoices(userSettings, model.id, validChoices), {
      onError: () => ToastService.showError(),
    });
  };

  const handleMenuSelect = (controlKey: string, optionKey?: string): void => {
    updateDraft((current) => (optionKey ? { ...current, [controlKey]: optionKey } : omit(current, controlKey)));
  };

  const handleSliderOptionChange = (controlKey: string, optionKey: string): void => {
    updateDraft((current) => ({ ...current, [controlKey]: optionKey }));
  };

  const handleMenuPress = (controlKey: string): void => {
    menuSheetRef.current?.present(controlKey);
  };

  const renderItem = ({ item: [controlKey, control] }: { item: [string, ModelControl] }): ReactElement => (
    <ModelControlRow
      controlKey={controlKey}
      control={control}
      choice={draftChoices[controlKey]}
      translateDefault={translate}
      onMenuPress={handleMenuPress}
      onSliderOptionChange={handleSliderOptionChange}
    />
  );

  return (
    <AppBottomSheet
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      onDismiss={onClose}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress} />
          <AppBottomSheetFlashList
            data={Object.entries(modelControls)}
            extraData={draftChoices}
            renderItem={renderItem}
            keyExtractor={([controlKey]) => controlKey}
            showsVerticalScrollIndicator={false}
            className='flex-1'
          />
          <ModelControlMenuSheet
            ref={menuSheetRef}
            controls={modelControls}
            choices={draftChoices}
            onSelect={handleMenuSelect}
          />
        </View>
      }
    />
  );
}
