import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { ActionSheetItemProps, ActionsBottomSheet, Icon } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ModelControl, ModelControlChoices } from '@open-webui-react-native/shared/data-access/api';

export type ModelControlMenuSheetMethods = {
  present: (controlKey: string) => void;
};

export type ModelControlMenuSheetRef = ForwardedRef<ModelControlMenuSheetMethods>;

export interface ModelControlMenuSheetProps {
  ref?: ModelControlMenuSheetRef;
  controls: Record<string, ModelControl>;
  choices: ModelControlChoices;
  onSelect: (controlKey: string, optionKey?: string) => void;
}

export function ModelControlMenuSheet({ ref, controls, choices, onSelect }: ModelControlMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.MODEL_CONTROLS_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const [activeControlKey, setActiveControlKey] = useState<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: (controlKey: string): void => {
        setActiveControlKey(controlKey);
        sheetRef.current?.present();
      },
    }),
    [],
  );

  const control = activeControlKey ? controls[activeControlKey] : undefined;
  const currentChoice = activeControlKey ? choices[activeControlKey] : undefined;

  const closeSheet = (): void => {
    sheetRef.current?.close();
  };

  const getActions = (): Array<ActionSheetItemProps> => {
    if (!control || !activeControlKey) {
      return [];
    }

    const defaultOptionLabel = control.default ? control.options[control.default]?.label : undefined;
    const isDefaultSelected = !currentChoice || !control.options[currentChoice];

    return [
      {
        title: defaultOptionLabel
          ? translate('TEXT_DEFAULT_WITH_OPTION', { option: defaultOptionLabel })
          : translate('TEXT_DEFAULT'),
        isIconShown: false,
        rightContent: isDefaultSelected ? <Icon name='tick' /> : undefined,
        onPress: (): void => {
          onSelect(activeControlKey);
          closeSheet();
        },
      },
      ...Object.entries(control.options).map(([optionKey, option]) => ({
        title: option.label,
        isIconShown: false,
        rightContent: currentChoice === optionKey ? <Icon name='tick' /> : undefined,
        onPress: (): void => {
          onSelect(activeControlKey, optionKey);
          closeSheet();
        },
      })),
    ];
  };

  // Push keeps the Model controls sheet open underneath.
  return (
    <ActionsBottomSheet
      ref={sheetRef}
      stackBehavior='push'
      title={control?.label}
      description={control?.description}
      actions={getActions()}
    />
  );
}
