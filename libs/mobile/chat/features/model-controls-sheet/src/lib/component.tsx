import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { isEqual } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { AppBottomSheet, SheetHeader, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AIModel,
  buildUserSettingsWithModelControlChoices,
  getModelControlChoices,
  UserSettings,
  usersApi,
  usersApiConfig,
} from '@open-webui-react-native/shared/data-access/api';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ModelControlMenuSheet, ModelControlMenuSheetMethods } from './components/model-control-menu-sheet';
import { ModelControlRow } from './components/model-control-row';
import { sanitizeModelControlChoices } from './utils/sanitize-model-control-choices';

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
  const draftTouchedRef = useRef(false);

  const { refetch } = usersApi.useGetUserSettings();
  const { mutate: updateUserSettings } = usersApi.useUpdateUserSettings({
    onError: () => ToastService.showError(),
  });

  const [draftChoices, setDraftChoices] = useState<Record<string, string>>({});

  const modelControls = model?.info?.params?.modelControls ?? {};
  const controlKeys = Object.keys(modelControls);

  const closeSheet = (): void => {
    sheetRef.current?.close();
  };

  const updateDraft = (updater: (current: Record<string, string>) => Record<string, string>): void => {
    draftTouchedRef.current = true;
    setDraftChoices(updater);
  };

  useImperativeHandle(
    ref,
    () => ({
      present: (): void => {
        if (!model) {
          return;
        }

        const settings = queryClient.getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey);
        setDraftChoices({ ...getModelControlChoices(settings, model.id) });
        draftTouchedRef.current = false;
        sheetRef.current?.present();

        void refetch().then(({ data }) => {
          if (!draftTouchedRef.current && data) {
            setDraftChoices({ ...getModelControlChoices(data, model.id) });
          }
        });
      },
    }),
    [model, refetch],
  );

  const handleConfirmPress = (): void => {
    if (!model) {
      closeSheet();

      return;
    }

    const settings = queryClient.getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey);

    if (!settings) {
      closeSheet();

      return;
    }

    const sanitizedDraft = sanitizeModelControlChoices(model, draftChoices);
    const cachedChoices = sanitizeModelControlChoices(model, getModelControlChoices(settings, model.id));

    if (isEqual(sanitizedDraft, cachedChoices)) {
      closeSheet();

      return;
    }

    updateUserSettings(buildUserSettingsWithModelControlChoices(settings, model.id, sanitizedDraft));
    closeSheet();
  };

  const handleMenuSelect = (controlKey: string, optionKey?: string): void => {
    updateDraft((current) => {
      const next = { ...current };

      if (!optionKey) {
        delete next[controlKey];

        return next;
      }

      next[controlKey] = optionKey;

      return next;
    });
  };

  const handleSliderOptionChange = (controlKey: string, optionKey: string): void => {
    updateDraft((current) => ({ ...current, [controlKey]: optionKey }));
  };

  const handleMenuPress = (controlKey: string): void => {
    menuSheetRef.current?.present(controlKey);
  };

  return (
    <AppBottomSheet
      isModal
      ref={sheetRef}
      onDismiss={() => {
        Keyboard.dismiss();
        onClose?.();
      }}
      content={
        <View className='gap-16'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress} />
          <View className='rounded-2xl overflow-hidden'>
            {model &&
              controlKeys.map((controlKey) => (
                <ModelControlRow
                  key={controlKey}
                  controlKey={controlKey}
                  control={modelControls[controlKey]}
                  model={model}
                  draftChoices={draftChoices}
                  translateDefault={translate}
                  onMenuPress={handleMenuPress}
                  onSliderOptionChange={handleSliderOptionChange}
                />
              ))}
          </View>
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
