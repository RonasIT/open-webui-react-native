import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { compact } from 'lodash-es';
import { ReactElement, useRef } from 'react';
import {
  ActionsBottomSheet,
  ActionsBottomSheetProps,
  ActionSheetItemProps,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { withOfflineGuard } from '@open-web-ui-mobile-client-react-native/shared/features/network';
import { alertService } from '@open-web-ui-mobile-client-react-native/shared/utils/alert-service';
import { FeatureID, isFeatureEnabled } from '@open-web-ui-mobile-client-react-native/shared/utils/feature-flag';
import { useExportArchivedChats, useUnarchiveChats } from '../../hooks';

interface ArchivedChatsActionsSheetProps {
  renderTrigger: ActionsBottomSheetProps['renderTrigger'];
}

export function ArchivedChatsActionsSheet({ renderTrigger }: ArchivedChatsActionsSheetProps): ReactElement {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_LIST.ARCHIVED_CHATS_ACTIONS_SHEET');

  const actionsHSeetRef = useRef<BottomSheetModal>(null);

  const { unarchiveAllChats, isUnarchiving: isUnarchivingAllChats } = useUnarchiveChats();

  const showUnarchiveAllAlert = (): void => {
    alertService.confirm({
      title: translate('TEXT_UNARCHIVE_CHATS'),
      message: translate('TEXT_ARE_YOU_SURE'),
      onConfirm: handleConfirmUnarchiveAll,
    });
  };

  const { exportArchivedChats, isExporting } = useExportArchivedChats();

  const handleConfirmUnarchiveAll = async (): Promise<void> => {
    await unarchiveAllChats();
    actionsHSeetRef.current?.close();
  };

  const handleExportArchivedChats = async (): Promise<void> => {
    await exportArchivedChats();
    actionsHSeetRef.current?.close();
  };

  const actions: Array<ActionSheetItemProps> = compact([
    {
      title: translate('BUTTON_RESTORE_ALL_CHATS'),
      iconName: 'unarchive',
      onPress: withOfflineGuard(showUnarchiveAllAlert),
      isLoading: isUnarchivingAllChats,
    },
    isFeatureEnabled(FeatureID.EXPORT_ARCHIVED_CHAT) && {
      title: translate('BUTTON_EXPORT_ALL_CHATS'),
      iconName: 'exportIcon',
      onPress: withOfflineGuard(handleExportArchivedChats),
      isLoading: isExporting,
    },
  ]);

  return <ActionsBottomSheet
    actions={actions}
    renderTrigger={renderTrigger}
    ref={actionsHSeetRef} />;
}
