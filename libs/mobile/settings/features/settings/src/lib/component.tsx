import { Host, Picker } from '@expo/ui';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppImage, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import {
  availableLanguages,
  availableMarkdownRenderers,
  LanguageCode,
  MarkdownRenderer,
} from '@open-webui-react-native/shared/utils/config';

export function Settings(): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN');
  const { colorScheme } = useColorScheme();
  const locale = useSelector(appState$.locale);
  const markdownRenderer = useSelector(appState$.markdownRenderer);

  const { data: profile } = authApi.useGetProfile();

  const handleLanguageChange = (value: LanguageCode): void => {
    appState$.setLocale(value);
  };

  const handleMarkdownRendererChange = (value: MarkdownRenderer): void => {
    appState$.setMarkdownRenderer(value);
  };

  return (
    <View>
      <View className='py-16 items-center justify-center'>
        <View className='w-64 h-64 rounded-full justify-center items-center'>
          <AppImage
            source={{ uri: profile?.profileImageUrl }}
            className='w-full h-full rounded-full'
            contentFit='cover'
          />
        </View>
      </View>
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
      <View className='flex-row items-center justify-between py-12'>
        <AppText className='text-h4-sm sm:text-h4'>{translate('TEXT_MARKDOWN_RENDERER')}</AppText>
        <Host matchContents colorScheme={colorScheme}>
          <Picker selectedValue={markdownRenderer} onValueChange={handleMarkdownRendererChange}>
            {availableMarkdownRenderers.map(({ code, labelKey }) => (
              <Picker.Item
                key={code}
                label={translate(labelKey)}
                value={code} />
            ))}
          </Picker>
        </Host>
      </View>
    </View>
  );
}
