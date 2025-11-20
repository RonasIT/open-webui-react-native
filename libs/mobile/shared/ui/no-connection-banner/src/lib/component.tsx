import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { View, Icon, AppText } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

interface NoConnectionBannerProps {
  isVisible?: boolean;
  className?: string;
}

export function NoConnectionBanner({ isVisible = false, className }: NoConnectionBannerProps): ReactElement | null {
  const translate = useTranslation('SHARED.NO_CONNECTION_BANNER');

  if (!isVisible) return null;

  return (
    <View
      className={cn(
        'absolute flex-1 top-[0] h-40 left-content-offset right-content-offset z-50 px-12 py-8 bg-status-warning-light rounded-2xl flex-row gap-8 items-center justify-center',
        className,
      )}>
      <Icon name='noWifi' className='color-black' />
      <AppText className='font-medium text-black'>{translate('TEXT_YOU_ARE_OFFLINE')}</AppText>
    </View>
  );
}
