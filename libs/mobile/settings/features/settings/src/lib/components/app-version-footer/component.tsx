import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import Constants from 'expo-constants';
import { ReactElement } from 'react';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export function AppVersionFooter(): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN');
  const { isDarkColorScheme } = useColorScheme();

  const version = Constants.expoConfig?.version;

  return (
    <View className='items-center gap-16 pt-64 pb-16'>
      <View className='w-full gap-8'>
        {!!version && (
          <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
            {translate('TEXT_APP_VERSION', { version })}
          </AppText>
        )}
        <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
          {translate('TEXT_APP_AUTHOR')}
        </AppText>
      </View>
      <Icon
        name={isDarkColorScheme ? 'ronasLogoDark' : 'ronasLogoLight'}
        width={32}
        height={32} />
    </View>
  );
}
