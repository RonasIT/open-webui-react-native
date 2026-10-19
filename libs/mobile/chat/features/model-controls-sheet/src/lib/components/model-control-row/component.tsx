import { ReactElement } from 'react';
import { ActionSheetItem, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AIModel,
  ModelControl,
  ModelControlDisplay,
  splitStaleModelControlChoices,
} from '@open-webui-react-native/shared/data-access/api';
import { getModelControlValueLabel } from '../../utils/get-model-control-value-label';
import { OptionSlider } from '../option-slider';

export interface ModelControlRowProps {
  controlKey: string;
  control: ModelControl;
  model: AIModel;
  draftChoices: Record<string, string>;
  translateDefault: (key: string, params?: Record<string, string>) => string;
  onMenuPress: (controlKey: string) => void;
  onSliderOptionChange: (controlKey: string, optionKey: string) => void;
}

export function ModelControlRow({
  controlKey,
  control,
  model,
  draftChoices,
  translateDefault,
  onMenuPress,
  onSliderOptionChange,
}: ModelControlRowProps): ReactElement {
  const { validChoices } = splitStaleModelControlChoices(model, draftChoices);
  const effectiveChoice = validChoices[controlKey];
  const valueLabel = getModelControlValueLabel(control, effectiveChoice, translateDefault);
  const isSlider = control.display === ModelControlDisplay.SLIDER;
  const optionKeys = Object.keys(control.options);

  if (isSlider) {
    return (
      <View className='bg-background-primary px-24 py-20 gap-12'>
        <View className='gap-4'>
          <AppText className='text-md-sm sm:text-md'>{control.label}</AppText>
          {control.description && (
            <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{control.description}</AppText>
          )}
          <AppText className='text-sm-sm sm:text-sm text-text-secondary text-right'>{valueLabel}</AppText>
        </View>
        <OptionSlider
          optionKeys={optionKeys}
          options={control.options}
          selectedOptionKey={effectiveChoice}
          defaultOptionKey={control.default}
          onOptionChange={(optionKey) => onSliderOptionChange(controlKey, optionKey)}
        />
      </View>
    );
  }

  return (
    <ActionSheetItem
      title={control.label}
      value={valueLabel}
      hasSubActions
      isIconShown={false}
      onPress={() => onMenuPress(controlKey)}
    />
  );
}
