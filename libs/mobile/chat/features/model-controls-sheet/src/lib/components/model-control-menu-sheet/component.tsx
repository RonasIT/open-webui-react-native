import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { ActionsBottomSheet, Icon } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ModelControl } from '@open-webui-react-native/shared/data-access/api';

export type ModelControlMenuSheetMethods = {
  present: (controlKey: string) => void;
};

export type ModelControlMenuSheetRef = ForwardedRef<ModelControlMenuSheetMethods>;

export interface ModelControlMenuSheetProps {
  ref?: ModelControlMenuSheetRef;
  controls: Record<string, ModelControl>;
  choices: Record<string, string>;
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

  if (!control || !activeControlKey) {
    return <ActionsBottomSheet ref={sheetRef} actions={[]} />;
  }

  const defaultOptionLabel = control.default ? control.options[control.default]?.label : undefined;
  const defaultTitle = defaultOptionLabel
    ? translate('TEXT_DEFAULT_WITH_OPTION', { option: defaultOptionLabel })
    : translate('TEXT_DEFAULT');

  const isDefaultSelected = !currentChoice || !control.options[currentChoice];

  const actions = [
    {
      title: defaultTitle,
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

  return (
    <ActionsBottomSheet
      ref={sheetRef}
      title={control.label}
      description={control.description}
      actions={actions} />
  );
}
