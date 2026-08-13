import { Host, Picker } from '@expo/ui';
import { useSelector } from '@legendapp/state/react';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppHeader, AppScreen, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { availableLanguages, LanguageCode } from '@open-webui-react-native/shared/utils/config';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useRouter } from 'expo-router';
import { ReactElement } from 'react';

// TODO: Temporary solution, update when design is ready
export default function SettingsScreen(): ReactElement {
  const router = useRouter();
  const translate = useTranslation('APP.SETTINGS_SCREEN');
  const { colorScheme } = useColorScheme();
  const locale = useSelector(appState$.locale);

  const handleLanguageChange = (value: LanguageCode): void => {
    appState$.setLocale(value);
  };

  return (
    <AppScreen
      header={<AppHeader
        title={translate('TEXT_SETTINGS')}
        onGoBack={router.back}
        titleClassName='max-w-[65%]' />}>
      <View className='flex-row items-center justify-between py-12'>
        <AppText className='text-h4-sm sm:text-h4'>{translate('TEXT_LANGUAGE')}</AppText>
        <Host matchContents colorScheme={colorScheme}>
          <Picker selectedValue={locale} onValueChange={handleLanguageChange}>
            {availableLanguages.map(({ code, label }) => (
              <Picker.Item
                key={code}
                label={label}
                value={code} />
            ))}
          </Picker>
        </Host>
      </View>
    </AppScreen>
  );
}
