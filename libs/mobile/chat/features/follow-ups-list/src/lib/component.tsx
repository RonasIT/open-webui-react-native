import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppDivider, AppPressable, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

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
      <AppText className='text-sm py-8 font-semibold'>{translate('TEXT_FOLLOW_UP')}</AppText>

      {followUps.map((followUp, index) => (
        <View key={followUp}>
          <AppPressable
            onPress={() => onPress(followUp)}
            className='active:opacity-1 active:bg-background-secondary p-8'>
            <AppText className='text-text-secondary text-sm-sm'>{followUp}</AppText>
          </AppPressable>

          {index < followUps.length - 1 && <AppDivider />}
        </View>
      ))}
    </View>
  );
}
