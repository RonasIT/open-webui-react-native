import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { Fragment, ReactElement, Ref, useState } from 'react';
import {
  AppText,
  View,
  AppBottomSheet,
  AppButton,
  AppSpinner,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { chatApi, getShareChatLink } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';

interface ShareChatModalProps {
  ref?: Ref<BottomSheetModal>;
  chatId: string;
}

export function ShareChatModal({ chatId, ref }: ShareChatModalProps): ReactElement {
  const translate = useTranslation('CHAT.SHARE_CHAT_MODAL');
  const [isOpen, setIsOpen] = useState(false);
  const { data: chat } = chatApi.useGet(chatId, {
    enabled: isOpen,
  });

  const { mutate: deleteShareChatLink, isPending: isDeleting } = chatApi.useDeleteShareChatLink();

  const handleCopyLink = async (shareId: string): Promise<void> => {
    await Clipboard.setStringAsync(getShareChatLink(shareId));
    ToastService.showSuccess(translate('TEXT_LINK_COPIED'));
  };

  const { mutate: shareChat, isPending: isSharing } = chatApi.useShareChat({
    onSuccess: (data) => handleCopyLink(data.id),
  });
  const isShared = !!chat?.shareId;

  const handleShareChat = async (): Promise<void> => {
    shareChat(chatId);
  };

  const handleDeleteLink = () => {
    deleteShareChatLink(chatId);
  };

  const handleBeforePress = () => {
    if (chat?.shareId) {
      handleCopyLink(chat.shareId);
    }
  };

  const renderSharedDescription = (): ReactElement => (
    <Fragment>
      {translate('TEXT_DESCRIPTION_SHARED_1')}{' '}
      <AppText className='text-text-secondary underline' onPress={handleBeforePress}>
        {translate('TEXT_BEFORE_LINK')}
      </AppText>
      . {translate('TEXT_DESCRIPTION_SHARED_2')}{' '}
      <AppText className='text-text-secondary underline' onPress={handleDeleteLink}>
        {translate('TEXT_DELETE_LINK')}
      </AppText>{' '}
      {translate('TEXT_DESCRIPTION_SHARED_3')}
    </Fragment>
  );

  const description = (
    <AppText className='text-text-secondary'>
      {isShared ? renderSharedDescription() : translate('TEXT_DESCRIPTION_NOT_SHARED')}
    </AppText>
  );

  return (
    <AppBottomSheet
      ref={ref}
      isModal={true}
      onOpen={() => setIsOpen(true)}
      content={
        !chat ? (
          <View className='h-[100] items-center justify-center'>
            <AppSpinner />
          </View>
        ) : (
          <View className='gap-12 pb-safe pt-16 android:pb-24'>
            <AppText className='text-h3-sm sm:text-h3 font-medium' numberOfLines={1}>
              {translate('TEXT_SHARE_CHAT')}
            </AppText>
            {description}
            <AppButton
              text={translate(isShared ? 'BUTTON_UPDATE_AND_COPY_LINK' : 'BUTTON_COPY_LINK')}
              iconName='link'
              iconClassName='color-background-primary'
              className='h-[48px]'
              onPress={handleShareChat}
              isLoading={isSharing || isDeleting}
            />
          </View>
        )
      }
    />
  );
}
