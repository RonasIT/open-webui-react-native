import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { ActionsBottomSheet, ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToolApprovalMode, toolApprovalState$ } from '@open-webui-react-native/shared/data-access/api';
import { SelectOptionIcon } from '../select-option-icon';

export interface ToolPermissionsMenuSheetProps {
  disabled?: boolean;
}

export function ToolPermissionsMenuSheet({ disabled }: ToolPermissionsMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.TOOL_PERMISSIONS_POPUP');
  const modalRef = useRef<BottomSheetModal>(null);

  const mode = useSelector(toolApprovalState$.mode);

  const selectMode = (nextMode: ToolApprovalMode): void => {
    toolApprovalState$.mode.set(nextMode);
    modalRef.current?.close();
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_FULL_ACCESS'),
      iconName: 'tick',
      isIconShown: mode === ToolApprovalMode.FULL,
      onPress: () => selectMode(ToolApprovalMode.FULL),
    },
    {
      title: translate('TEXT_ASK_FOR_APPROVAL'),
      iconName: 'tick',
      isIconShown: mode === ToolApprovalMode.ASK,
      onPress: () => selectMode(ToolApprovalMode.ASK),
    },
  ];

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <SelectOptionIcon
      iconName='key'
      onPress={onPress}
      isSelected={mode === ToolApprovalMode.ASK}
      disabled={disabled} />
  );

  return <ActionsBottomSheet
    ref={modalRef}
    renderTrigger={renderTrigger}
    actions={actions} />;
}
