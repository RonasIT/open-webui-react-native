import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ModelControl, ModelControlDisplay } from '@open-webui-react-native/shared/data-access/api';
import { getModelControlDefaultLabel, getModelControlValueLabel } from '../../utils';
import { OptionSlider } from '../option-slider';

export interface ModelControlRowProps {
  controlKey: string;
  control: ModelControl;
  choice?: string;
  onMenuPress: (controlKey: string) => void;
  onSliderOptionChange: (controlKey: string, optionKey?: string) => void;
}

export function ModelControlRow({
  controlKey,
  control,
  choice,
  onMenuPress,
  onSliderOptionChange,
}: ModelControlRowProps): ReactElement {
  const translate = useTranslation('CHAT.MODEL_CONTROLS_SHEET.MODEL_CONTROL_ROW');

  // A stale choice (option removed by the admin) shows as the default.
  const validChoice = choice && control.options[choice] ? choice : undefined;
  const valueLabel = getModelControlValueLabel(control, validChoice, translate);
  const isSlider = control.display === ModelControlDisplay.SLIDER;

  const header = (
    // Value sits on the title line, so a long description does not move it.
    <View className='flex-row items-start gap-16'>
      <View className='flex-1'>
        <AppText className='text-md-sm sm:text-md'>{control.label}</AppText>
        {!!control.description && (
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{control.description}</AppText>
        )}
      </View>
      <View className='max-w-[40%] flex-row items-center gap-8'>
        <AppText numberOfLines={1} className='shrink text-right text-md-sm sm:text-md text-text-secondary'>
          {valueLabel}
        </AppText>
        {!isSlider && <Icon name='chevronRight' className='shrink-0' />}
      </View>
    </View>
  );

  if (isSlider) {
    return (
      <View className='py-12 gap-16'>
        {header}
        <OptionSlider
          options={control.options}
          choice={validChoice}
          defaultOptionKey={control.default}
          onOptionChange={(optionKey) => onSliderOptionChange(controlKey, optionKey)}
        />
        <AppPressable
          disabled={!validChoice}
          className={cn('self-start active:opacity-60', !validChoice && 'opacity-40')}
          onPress={() => onSliderOptionChange(controlKey)}>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
            {getModelControlDefaultLabel(control, translate)}
          </AppText>
        </AppPressable>
      </View>
    );
  }

  return (
    <AppPressable className='py-12 active:opacity-60' onPress={() => onMenuPress(controlKey)}>
      {header}
    </AppPressable>
  );
}
