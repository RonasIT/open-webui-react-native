import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface FollowUpsListProps {
  onPress: (text: string) => void;
  followUps?: Array<string>;
  containerClassName?: string;
}

export function FollowUpsList({ onPress, followUps, containerClassName }: FollowUpsListProps): ReactElement | null {
  const translate = useTranslation('CHAT.MESSAGE_FOLLOW_UPS');

  if (!followUps?.length) return null;

  return (
    <View className={cn(containerClassName)}>
      <AppText className='text-sm py-8'>{translate('TEXT_FOLLOW_UP')}</AppText>

      {followUps.map((followUp) => (
        <AppPressable
          key={followUp}
          onPress={() => onPress(followUp)}
          className='active:opacity-1 active:bg-background-secondary py-8 rounded-lg'>
          <AppText className='text-text-secondary text-sm'>{followUp}</AppText>
        </AppPressable>
      ))}
    </View>
  );
}
