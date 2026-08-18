import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppBottomSheet,
  AppBottomSheetPropsType,
  AppButton,
  AppText,
  Icon,
  IconButton,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { SupportAttachment } from '../../types';

export type ContactSupportSheetMethods = {
  present: () => void;
};

export type ContactSupportSheetRef = ForwardedRef<ContactSupportSheetMethods>;

export type ContactSupportSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  ref?: ContactSupportSheetRef;
};

export function ContactSupportSheet({ ref, ...props }: ContactSupportSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.CONTACT_SUPPORT_SHEET');
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Array<SupportAttachment>>([]);

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(ref, () => ({ present: () => sheetRef.current?.present() }), []);

  const handleAttachPress = async (): Promise<void> => {
    const media = await imagePickerService.getImage(ImagePickerSource.GALLERY);
    const asset = media?.assets?.[0];

    if (!asset) {
      return;
    }

    setAttachments((currentAttachments) => [
      ...currentAttachments,
      { uri: asset.uri, name: asset.fileName || asset.uri.split('/').pop() || '' },
    ]);
  };

  const handleRemoveAttachmentPress = (uri: string): void =>
    setAttachments((currentAttachments) => currentAttachments.filter((attachment) => attachment.uri !== uri));

  const renderAttachment = ({ uri, name }: SupportAttachment): ReactElement => (
    <View key={uri} className='flex-row items-center gap-12'>
      <Icon
        name='file'
        width={20}
        height={20}
        className='shrink-0 color-text-secondary' />
      <AppText numberOfLines={1} className='flex-1 text-sm-sm sm:text-sm text-text-secondary'>
        {name}
      </AppText>
      <IconButton
        iconName='closeSM'
        className='p-4'
        iconProps={{ className: 'color-text-secondary' }}
        onPress={() => handleRemoveAttachmentPress(uri)}
      />
    </View>
  );

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={closeSheet} />
          <BottomSheetTextInput
            multiline
            value={message}
            onChangeText={setMessage}
            textAlignVertical='top'
            placeholder={translate('TEXT_MESSAGE_PLACEHOLDER')}
            placeholderTextColor={colors.textSecondary}
            className='flex-1 py-8 font-inter text-md-sm sm:text-md text-text-primary'
          />
          <View className='gap-12 pt-12' style={{ paddingBottom: bottom + 16 }}>
            {attachments.map(renderAttachment)}
            <AppButton
              variant='outline'
              iconName='link'
              size='sm'
              text={translate('BUTTON_ATTACH')}
              onPress={handleAttachPress}
            />
          </View>
        </View>
      }
    />
  );
}
