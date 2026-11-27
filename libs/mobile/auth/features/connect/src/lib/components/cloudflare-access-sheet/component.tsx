import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, Ref, useState } from 'react';
import { CloudflareAccessWebView } from '@open-webui-react-native/mobile/auth/features/cloudflare-access-web-view';
import {
  AppBottomSheet,
  AppButton,
  AppText,
  Icon,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';

export interface CloudflareAccessSheetProps {
  ref: Ref<BottomSheetModal>;
  serverUrl: string;
  onClose: () => void;
  onAccessPass: (accessPass: string) => void;
}

export function CloudflareAccessSheet({ ref, serverUrl, onClose, onAccessPass }: CloudflareAccessSheetProps): ReactElement {
  const translate = useTranslation('AUTH.CONNECT.CLOUDFLARE_ACCESS_SHEET');
  const bottomInset = useBottomInset();

  const [isAccessWebViewVisible, setIsAccessWebViewVisible] = useState(false);

  const handleAccessPass = (value: string): void => {
    setIsAccessWebViewVisible(false);
    onAccessPass(value);
  };

  return (
    <Fragment>
      <AppBottomSheet
        ref={ref}
        isScrollable
        snapPoints={['100%']}
        content={
          <View className='flex-1 gap-40 py-16' style={{ paddingBottom: bottomInset }}>
            <SheetHeader title={translate('TEXT_TITLE')} onGoBack={onClose} />
            <View className='flex-1 items-center justify-center gap-40'>
              <View className='size-120 items-center justify-center rounded-full bg-background-secondary'>
                <Icon name='cloudflare' />
              </View>
              <AppText className='text-md-sm sm:text-md text-center'>{translate('TEXT_DESCRIPTION')}</AppText>
            </View>
            <AppButton
              text={translate('BUTTON_SIGN_IN_WITH_CLOUDFLARE')}
              testID='connect-cloudflare-access'
              onPress={() => setIsAccessWebViewVisible(true)}
            />
          </View>
        }
      />
      <CloudflareAccessWebView
        isVisible={isAccessWebViewVisible}
        serverUrl={serverUrl}
        onClose={() => setIsAccessWebViewVisible(false)}
        onAccessPass={handleAccessPass}
      />
    </Fragment>
  );
}
