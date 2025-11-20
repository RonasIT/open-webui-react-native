import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { Icon } from '../icon';
import { AppPressable } from '../pressable';
import { AppTextInput } from '../text-input';

export interface PressableSearchInputProps {
  onPress: () => void;
  placeholder?: string;
  containerClassName?: string;
}

export function PressableSearchInput({
  placeholder,
  containerClassName,
  onPress,
}: PressableSearchInputProps): ReactElement {
  const translate = useTranslation('SHARED.PRESSABLE_SEARCH_INPUT');

  return (
    <AppPressable onPress={onPress} className={containerClassName}>
      <AppTextInput
        pointerEvents='none'
        accessoryLeft={<Icon name='search' className='color-text-secondary' />}
        editable={false}
        placeholder={placeholder || translate('TEXT_SEARCH_CHATS')}
        className='mb-8'
      />
    </AppPressable>
  );
}
