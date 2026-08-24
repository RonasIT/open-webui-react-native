import { PropsWithChildren, ReactElement } from 'react';
import { IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface ChatInputBottomRowProps extends PropsWithChildren {
  onSubmit: () => void;
  onVoiceModePress: () => void;
  onStopGenerationPress: () => void;
  isResponseGenerating?: boolean;
  // NOTE: When queueing is enabled, the send button must stay reachable alongside Stop, so the
  // next message can still be composed/queued while a response is generating.
  isMessageQueueEnabled?: boolean;
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
  isResponseGenerating,
  isMessageQueueEnabled,
  onStopGenerationPress,
}: ChatInputBottomRowProps): ReactElement {
  const showSendButton = !isResponseGenerating || isMessageQueueEnabled;

  return (
    <View className='flex-row justify-between items-center mt-12'>
      {children}
      <View className='flex-row items-center gap-8'>
        {isResponseGenerating && <IconButton
          iconName='stop'
          className='p-0'
          onPress={onStopGenerationPress} />}
        {showSendButton && (
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
    </View>
  );
}
