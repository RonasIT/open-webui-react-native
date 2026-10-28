import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { i18n, useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { compact } from 'lodash-es';
import { PropsWithChildren, ReactElement, useRef } from 'react';
import { View } from 'react-native';
import { useDeleteMessage } from '@open-webui-react-native/mobile/chat/features/use-delete-message';
import { MessageActionsSheetWrapper } from '@open-webui-react-native/mobile/chat/ui/message-actions-wrapper';
import { ActionsBottomSheet, ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Message, replaceDetailsWithMarkers } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { removeDetailsBlocks } from '@open-webui-react-native/shared/utils/strings';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface AiMessageActionsProps {
  chatId: string;
  message: Message;
  onEditPress: (messageId: string, content: string) => void;
  onSuggestPress: (messageId: string) => void;
  onContinueResponsePress: (messageId: string, content: string) => void;
  onTryAgain: (messageId: string) => void;
  onAddDetails: (messageId: string) => void;
  onMoreConcise: (messageId: string) => void;
  isLast: boolean;
  isResponseGenerating: boolean;
  isSkeleton: boolean;
  canDelete: boolean;
}

//TODO Extend with more actions - https://www.figma.com/design/YPCZjyVlD86psDwUxvMVBc/OpenWebUI-Redesign-React-Native?node-id=27540-25291&t=kg2yUIDp3UQDStLf-0
export function AiMessageActions({
  chatId,
  message,
  onEditPress,
  onSuggestPress,
  onContinueResponsePress,
  onTryAgain,
  onAddDetails,
  onMoreConcise,
  isLast,
  isResponseGenerating,
  isSkeleton,
  canDelete,
  children,
}: PropsWithChildren<AiMessageActionsProps>): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE_ACTIONS');

  const actionsSheetRef = useRef<BottomSheetModal>(null);
  const regenerateActionsSheetRef = useRef<BottomSheetModal>(null);
  const isOfflineMode = useSelector(appState$.isOfflineMode);

  const close = (): void => actionsSheetRef.current?.dismiss();

  const { deleteMessage, isDeleting } = useDeleteMessage({
    chatId,
    onDeleted: close,
  });

  const isChangeDisabled = isResponseGenerating || isSkeleton;
  // NOTE: Older Open WebUI versions keep reasoning and tool calls in the text as `<details>` blocks.
  const answerText = removeDetailsBlocks(message.content ?? '');

  const copyToClipboard = async (): Promise<void> => {
    await Clipboard.setStringAsync(answerText);
    ToastService.showSuccess(i18n.t('SHARED.COMMON.TEXT_COPIED_TO_CLIPBOARD'));
    close();
  };

  const handleEditPress = (): void => {
    onEditPress(message.id, replaceDetailsWithMarkers(message.content));
    close();
  };

  const handleContinueResponsePress = (): void => {
    onContinueResponsePress(message.id, message.content);
    close();
  };

  const openRegenerateActions = (): void => {
    //NOTE: Dismiss the main sheet first, otherwise the default 'switch' stack behavior minimizes it
    // and a later dismiss() leaves it stuck in DISMISSING, so it never opens again
    close();
    regenerateActionsSheetRef.current?.present();
  };

  const runRegenerateAction = withOfflineGuard((action?: (messageId: string) => void): void => {
    //NOTE: Small delay ensures sheet is fully closed before showing input
    setTimeout(() => {
      action?.(message.id);
    }, 100);

    regenerateActionsSheetRef.current?.dismiss();
  });

  const handleSuggestPress = (): void => {
    runRegenerateAction(onSuggestPress);
  };

  const handleTryAgainPress = (): void => {
    runRegenerateAction(onTryAgain);
  };

  const handleAddDetailsPress = (): void => {
    runRegenerateAction(onAddDetails);
  };

  const handleMoreConcisePress = (): void => {
    runRegenerateAction(onMoreConcise);
  };

  const actions: Array<ActionSheetItemProps> = compact([
    {
      title: translate('TEXT_EDIT'),
      iconName: 'editPencil',
      onPress: withOfflineGuard(handleEditPress),
      disabled: isChangeDisabled,
      isInactive: isOfflineMode,
    },
    {
      title: translate('TEXT_COPY'),
      iconName: 'copy',
      onPress: copyToClipboard,
      disabled: isSkeleton || !answerText,
    },
    isLast && {
      title: translate('TEXT_CONTINUE_RESPONSE'),
      iconName: 'play',
      onPress: withOfflineGuard(handleContinueResponsePress),
      disabled: isChangeDisabled,
      isInactive: isOfflineMode,
    },
    {
      title: translate('TEXT_REGENERATE'),
      iconName: 'refresh',
      onPress: withOfflineGuard(openRegenerateActions),
      hasSubActions: true,
      disabled: isResponseGenerating,
      isInactive: isOfflineMode,
    },
    canDelete && {
      title: translate('TEXT_DELETE'),
      iconName: 'trashCan',
      onPress: withOfflineGuard(() => deleteMessage(message.id)),
      isInactive: isOfflineMode,
      isDanger: true,
      isLoading: isDeleting,
      disabled: isResponseGenerating,
    },
  ]);

  const regenerateActions: Array<ActionSheetItemProps> = [
    {
      title: translate('REGENERATE_MESSAGE_ACTION_SHEET.TEXT_SUGGEST_A_CHANGE'),
      iconName: 'keyboard',
      onPress: handleSuggestPress,
      disabled: isChangeDisabled,
    },
    {
      title: translate('REGENERATE_MESSAGE_ACTION_SHEET.TEXT_TRY_AGAIN'),
      iconName: 'refresh',
      onPress: handleTryAgainPress,
      disabled: isResponseGenerating,
    },
    {
      title: translate('REGENERATE_MESSAGE_ACTION_SHEET.TEXT_ADD_DETAILS'),
      iconName: 'moreText',
      onPress: handleAddDetailsPress,
      disabled: isChangeDisabled,
    },
    {
      title: translate('REGENERATE_MESSAGE_ACTION_SHEET.TEXT_MORE_CONCISE'),
      iconName: 'lessText',
      onPress: handleMoreConcisePress,
      disabled: isChangeDisabled,
    },
  ];

  return (
    <View>
      <MessageActionsSheetWrapper actions={actions} sheetRef={actionsSheetRef}>
        {children}
      </MessageActionsSheetWrapper>
      <ActionsBottomSheet
        onClose={() => regenerateActionsSheetRef.current?.dismiss()}
        onBackdropPress={() => regenerateActionsSheetRef.current?.dismiss()}
        actions={regenerateActions}
        areActionsInactive={isOfflineMode}
        ref={regenerateActionsSheetRef}
      />
    </View>
  );
}
