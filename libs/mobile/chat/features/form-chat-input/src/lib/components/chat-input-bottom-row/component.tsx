import { PropsWithChildren, ReactElement } from 'react';
import { IconButton, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

export interface ChatInputBottomRowProps extends PropsWithChildren {
  onSubmit: () => void;
  onVoiceModePress: () => void;
  isVoiceModeAvailable?: boolean;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
}

export function ChatInputBottomRow({
  onSubmit,
  onVoiceModePress,
  isVoiceModeAvailable,
  isLoading,
  children,
  isSubmitDisabled,
}: ChatInputBottomRowProps): ReactElement {
  return (
    <View className='flex-row justify-between items-center mt-12'>
      {children}
      <IconButton
        disabled={isSubmitDisabled}
        onPress={isVoiceModeAvailable ? onVoiceModePress : onSubmit}
        iconName={isVoiceModeAvailable ? 'headphones' : 'arrowUp'}
        className='rounded-full self-end bg-text-primary p-4'
        iconProps={{ className: 'color-background-primary' }}
        isLoading={isLoading}
      />
    </View>
  );
}
