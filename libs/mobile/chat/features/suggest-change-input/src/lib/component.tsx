import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { Path, Control, useController, FieldValues } from 'react-hook-form';
import {
  AppTextInput,
  AppButton,
  AppText,
  View,
  Icon,
  AppInputProps,
  IconButton,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface SuggestChangeInputProps<T extends FieldValues> extends AppInputProps {
  onCancel: () => void;
  onSend: (message: string) => void;
  name: Path<T>;
  control: Control<T>;
}

export function SuggestChangeInput<T extends FieldValues>({
  name,
  control,
  onCancel,
  onSend,
  autoFocus,
}: SuggestChangeInputProps<T>): ReactElement {
  const translate = useTranslation('CHAT.SUGGEST_CHANGE_INPUT');

  const { field } = useController({ control, name });

  return (
    <AppTextInput
      multiline
      value={field.value}
      onChangeText={field.onChange}
      textClassName='max-h-[200px] px-6 mx-[-4] text-md-sm sm:text-md'
      autoFocus={autoFocus}
      accessoryTop={
        <View className='flex-row items-center gap-4 mb-4'>
          <Icon
            width={16}
            height={16}
            name='editPencil'
            className='color-text-secondary' />
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate('TEXT_SUGGEST_A_CHANGE')}</AppText>
        </View>
      }
      accessoryBottom={
        <View className='flex-row mt-12 justify-between'>
          <AppButton
            variant='outline'
            className='border-background-tertiary bg-background-primary'
            size='xs'
            text={translate('BUTTON_CANCEL')}
            onPress={onCancel}
          />
          <IconButton
            iconName='arrowUp'
            onPress={() => onSend(field.value)}
            className='rounded-full bg-text-primary p-4'
            iconProps={{ className: 'color-background-primary' }}
          />
        </View>
      }
    />
  );
}
