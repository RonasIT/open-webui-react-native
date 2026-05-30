import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { Alert } from 'react-native';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import {
  Avatar,
  AppBottomSheetProps,
  ActionsBottomSheet,
  ActionSheetItemProps,
  AppPressable,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi } from '@open-webui-react-native/shared/data-access/api';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface ProfileMenuSheetProps extends Pick<AppBottomSheetProps, 'renderTrigger'> {
  onArchivedChatsPress: () => void;
}

export function ProfileMenuSheet({ onArchivedChatsPress, ...restProps }: ProfileMenuSheetProps): ReactElement {
  const translate = useTranslation('PROFILE.PROFILE_MENU_SHEET');
  const { logout, isLoading } = useLogout();

  const { data: profile } = authApi.useGetProfile();

  const actionsBottomSheetRef = useRef<BottomSheetModal>(null);

  const closeActionsSheet = (): Promise<void> =>
    new Promise((resolve) => {
      actionsBottomSheetRef.current?.close();
      setTimeout(() => resolve(), 250);
    });

  const handleArchivedChatsPress = async (): Promise<void> => {
    await closeActionsSheet();
    onArchivedChatsPress();
  };

  const handleDeleteAccountPress = (): void => {
    ToastService.show(translate('TEXT_ACCOUNT_DELETION_REQUEST'));
  };

  const handleRequestDeleteAccountPress = async (): Promise<void> => {
    await closeActionsSheet();
    Alert.alert(
      translate('TEXT_DELETE_ACCOUNT_TITLE'),
      translate('TEXT_DELETE_ACCOUNT_MESSAGE'),
      [
        { text: translate('BUTTON_DELETE_ACCOUNT'), style: 'destructive', onPress: handleDeleteAccountPress },
        { text: translate('BUTTON_DONT_DELETE'), style: 'cancel' },
      ],
      {
        userInterfaceStyle: 'dark',
      },
    );
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_ARCHIVED_CHATS'),
      iconName: 'archive',
      onPress: isFeatureEnabled(FeatureID.ARCHIVE_CHAT)
        ? handleArchivedChatsPress
        : ToastService.showFeatureNotImplemented,
    },
    {
      title: translate('TEXT_DELETE_ACCOUNT'),
      iconName: 'trashCan',
      onPress: handleRequestDeleteAccountPress,
      isDanger: true,
    },
    {
      title: translate('TEXT_LOGOUT'),
      iconName: 'logout',
      onPress: logout,
      isLoading,
      disabled: isLoading,
      isDanger: true,
    },
  ];

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <AppPressable onPress={onPress}>
      <Avatar source={{ uri: profile?.profileImageUrl }} />
    </AppPressable>
  );

  return (
    <ActionsBottomSheet
      ref={actionsBottomSheetRef}
      renderTrigger={renderTrigger}
      actions={actions}
      {...restProps} />
  );
}
