import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { ActionsBottomSheet, ActionSheetItemProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Tool } from '@open-webui-react-native/shared/data-access/api';
import { SelectOptionIcon } from '../select-option-icon';

export interface ToolsMenuSheetProps {
  tools: Array<Tool>;
  selectedToolIds: Array<string>;
  onToolPress: (toolId: string) => void;
  disabled?: boolean;
}

export function ToolsMenuSheet({ tools, selectedToolIds, onToolPress, disabled }: ToolsMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.TOOLS_POPUP');
  const modalRef = useRef<BottomSheetModal>(null);

  // The sheet stays open after a tap so several tools can be toggled in one go.
  const actions: Array<ActionSheetItemProps> = tools.map((tool) => ({
    title: tool.name,
    iconName: 'tick',
    isIconShown: selectedToolIds.includes(tool.id),
    // Signing into an OAuth-protected server happens in the web interface, so the app can only
    // show that the tool is unusable until then.
    disabled: tool.authenticated === false,
    onPress: () => onToolPress(tool.id),
  }));

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <SelectOptionIcon
      iconName='tools'
      onPress={onPress}
      isSelected={selectedToolIds.length > 0}
      disabled={disabled} />
  );

  return (
    <ActionsBottomSheet
      ref={modalRef}
      title={translate('TEXT_TITLE')}
      renderTrigger={renderTrigger}
      actions={actions.length ? actions : [{ title: translate('TEXT_NO_TOOLS_AVAILABLE'), disabled: true }]}
    />
  );
}
