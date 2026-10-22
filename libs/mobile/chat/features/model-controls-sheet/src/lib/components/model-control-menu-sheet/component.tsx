import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { ActionsBottomSheet, ActionsBottomSheetAction, Icon } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
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
  const translate = useTranslation('CHAT.MODEL_CONTROLS_SHEET.MODEL_CONTROL_MENU_SHEET');
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

  const getActions = (): Array<ActionsBottomSheetAction> => {
    if (!control || !activeControlKey) {
      return [];
    }

    // An explicit choice equal to the default counts as the default too.
    const isDefaultSelected = !currentChoice || !control.options[currentChoice] || currentChoice === control.default;
    const hasDefaultOption = !!control.default && !!control.options[control.default];

    const resetToDefault = (): void => {
      onSelect(activeControlKey);
      closeSheet();
    };

    const optionActions = Object.entries(control.options).map(([optionKey, option]) => {
      const isDefaultOption = hasDefaultOption && optionKey === control.default;
      const isSelected = isDefaultOption ? isDefaultSelected : currentChoice === optionKey;

      return {
        // NOTE: Prefixed so an option keyed `default` doesn't clash with the Default item.
        key: `option-${optionKey}`,
        title: isDefaultOption ? translate('TEXT_DEFAULT_OPTION', { option: option.label }) : option.label,
        isIconShown: false,
        rightContent: isSelected ? <Icon name='tick' /> : undefined,
        onPress: isDefaultOption
          ? resetToDefault
          : (): void => {
              onSelect(activeControlKey, optionKey);
              closeSheet();
            },
      };
    });

    if (hasDefaultOption) {
      return optionActions;
    }

    return [
      {
        key: 'default',
        title: translate('TEXT_DEFAULT'),
        isIconShown: false,
        rightContent: isDefaultSelected ? <Icon name='tick' /> : undefined,
        onPress: resetToDefault,
      },
      ...optionActions,
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
