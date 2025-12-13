import { PropsWithChildren, ReactElement } from 'react';
import { IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface ChatInputBottomRowProps extends PropsWithChildren {
  onSubmit: () => void;
  onVoiceModePress: () => void;
  onStopGenerationPress: () => void;
  isResponseGenerating?: boolean;
  isVoiceModeAvailable?: boolean;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
  isStopResponseEnabled?: boolean;
}

export function ChatInputBottomRow({
  onSubmit,
  onVoiceModePress,
  isVoiceModeAvailable,
  isLoading,
  children,
  isSubmitDisabled,
  isResponseGenerating,
  onStopGenerationPress,
  isStopResponseEnabled = true,
}: ChatInputBottomRowProps): ReactElement {
  return (
    <View className='flex-row justify-between items-center mt-12'>
      {children}
      {isResponseGenerating ? (
        <IconButton
          iconName='stop'
          className='p-0'
          isLoading={!isStopResponseEnabled}
          disabled={!isStopResponseEnabled}
          onPress={onStopGenerationPress}
        />
      ) : (
        <IconButton
          disabled={isSubmitDisabled}
          onPress={isVoiceModeAvailable ? onVoiceModePress : onSubmit}
          iconName={isVoiceModeAvailable ? 'headphones' : 'arrowUp'}
          className='rounded-full self-end bg-text-primary p-4'
          iconProps={{ className: 'color-background-primary' }}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}
