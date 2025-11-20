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
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

interface EditMessageInputProps<T extends FieldValues> extends AppInputProps {
  onSave: (message: string) => void;
  onCancel: () => void;
  onSend: (message: string) => void;
  isAiMessage: boolean;
  name: Path<T>;
  control: Control<T>;
}

export function EditMessageInput<T extends FieldValues>({
  name,
  control,
  onSave,
  onCancel,
  onSend,
  isAiMessage,
  autoFocus,
}: EditMessageInputProps<T>): ReactElement {
  const translate = useTranslation('CHAT.EDIT_MESSAGE_INPUT');

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
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate('TEXT_EDIT_MESSAGE')}</AppText>
        </View>
      }
      accessoryBottom={
        <View className='flex-row mt-12'>
          <AppButton
            variant='outline'
            size='xs'
            className='border-background-tertiary bg-background-primary'
            text={translate(isAiMessage ? 'BUTTON_SAVE_AS_COPY' : 'BUTTON_SAVE')}
            onPress={() => onSave(field.value)}
          />
          <View className='flex-row gap-12 justify-end flex-1'>
            <AppButton
              variant='outline'
              className='border-background-tertiary bg-background-primary'
              size='xs'
              text={translate('BUTTON_CANCEL')}
              onPress={onCancel}
            />
            <AppButton
              size='xs'
              text={translate(isAiMessage ? 'BUTTON_SAVE' : 'BUTTON_SEND')}
              onPress={() => onSend(field.value)}
            />
          </View>
        </View>
      }
    />
  );
}
