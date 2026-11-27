import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { Linking } from 'react-native';
import { AppPressable, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { constants } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export function SupportLink(): ReactElement {
  const translate = useTranslation('AUTH.SUPPORT_LINK');

  const handleSupportPress = async (): Promise<void> => {
    const mailUrl = `mailto:${constants.supportEmail}`;

    try {
      const canOpenMailUrl = await Linking.canOpenURL(mailUrl);

      if (canOpenMailUrl) {
        await Linking.openURL(mailUrl);
      }
    } catch {
      ToastService.showError(translate('TEXT_NO_EMAIL_APP_FOUND', { email: constants.supportEmail }));
    }
  };

  return (
    <View className='mt-auto pt-40 pb-16 gap-4'>
      <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
        {translate('TEXT_NEED_HELP_OR_FEEDBACK')}
      </AppText>
      <AppPressable
        className='self-center'
        onPress={handleSupportPress}
        hitSlop={12}>
        <AppText className='text-sm-sm sm:text-sm text-brand-primary text-center'>
          {translate('TEXT_EMAIL_RONAS_IT')}
        </AppText>
      </AppPressable>
    </View>
  );
}
