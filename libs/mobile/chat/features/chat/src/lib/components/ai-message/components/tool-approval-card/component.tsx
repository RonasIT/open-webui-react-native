import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { AppButton, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface ToolApprovalCardProps {
  toolName: string;
  onAllowPress: () => void;
  onDenyPress: () => void;
  toolArguments?: string;
  isResolving?: boolean;
}

export function ToolApprovalCard({
  toolName,
  toolArguments,
  isResolving,
  onAllowPress,
  onDenyPress,
}: ToolApprovalCardProps): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE.TOOL_APPROVAL_CARD');

  return (
    <View className='gap-10 rounded-xl bg-background-secondary px-12 py-10'>
      <View className='flex-row items-center gap-8'>
        <Icon name='alert' className='size-20 shrink-0 color-status-warning-orange' />
        <View className='min-w-0 flex-1 flex-row flex-wrap items-center'>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate('TEXT_ALLOW_PREFIX')} </AppText>
          <AppText className='text-sm-sm sm:text-sm font-mono font-semibold text-text-primary'>{toolName}</AppText>
          <AppText className='text-sm-sm sm:text-sm text-text-secondary'>?</AppText>
        </View>
      </View>
      {!!toolArguments && (
        <AppText numberOfLines={4} className='text-xs font-mono text-text-secondary'>
          {toolArguments}
        </AppText>
      )}
      <View className='flex-row items-center gap-8'>
        <AppButton
          text={translate('BUTTON_ALLOW')}
          size='sm'
          className='px-16'
          isLoading={isResolving}
          disabled={isResolving}
          onPress={onAllowPress}
        />
        <AppButton
          text={translate('BUTTON_DENY')}
          size='sm'
          variant='ghost'
          disabled={isResolving}
          onPress={onDenyPress}
        />
      </View>
    </View>
  );
}
