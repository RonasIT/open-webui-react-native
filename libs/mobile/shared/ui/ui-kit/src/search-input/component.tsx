import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { Platform } from 'react-native';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppBottomSheetTextInput } from '../bottom-sheet-text-input';
import { Icon } from '../icon';
import { GestureAppPressable, AppPressable } from '../pressable';
import { AppText } from '../text';
import { AppTextInput, AppInputProps } from '../text-input';
import { View } from '../view';

interface SearchInputProps extends AppInputProps {
  onCancel: () => void;
  isInBottomSheet?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  onCancel,
  placeholder,
  className,
  autoFocus,
  isInBottomSheet,
}: SearchInputProps): ReactElement {
  const translate = useTranslation('SHARED.SEARCH_INPUT');

  const InputComponent = isInBottomSheet ? AppBottomSheetTextInput : AppTextInput;

  //NOTE: AppPressable does not work correctly in modal on IOS, but GestureAppPressable does not work correctly in modal on Android
  const PressableComponent = Platform.OS === 'ios' ? GestureAppPressable : AppPressable;

  return (
    <View className={cn('flex-row items-center w-full py-8', className)}>
      <View className='flex-1'>
        <InputComponent
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || translate('TEXT_SEARCH_CHATS')}
          autoFocus={autoFocus}
          accessoryLeft={<Icon name='search' className='color-text-secondary' />}
        />
      </View>
      <PressableComponent
        onPress={onCancel}
        className='ml-10'
        hitSlop={8}>
        <AppText className='text-brand-primary text-sm-sm sm:text-sm'>{translate('BUTTON_CANCEL')}</AppText>
      </PressableComponent>
    </View>
  );
}
