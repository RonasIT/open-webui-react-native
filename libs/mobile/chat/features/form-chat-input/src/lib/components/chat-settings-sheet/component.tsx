import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useRef } from 'react';
import {
  ActionSheetItem,
  AppBottomSheet,
  AppSwitch,
  AppText,
  Icon,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  ChatResponse,
  Tool,
  ToolApprovalMode,
  toolApprovalState$,
} from '@open-webui-react-native/shared/data-access/api';
import { useChatSystemPrompt } from '../../hooks';
import { SelectOptionIcon } from '../select-option-icon';
import { SystemPromptSheet, SystemPromptSheetMethods } from '../system-prompt-sheet';
import { ToolsSheet, ToolsSheetMethods } from '../tools-sheet';

export interface ChatSettingsSheetProps {
  tools: Array<Tool>;
  selectedToolIds: Array<string>;
  onApplyToolIds: (toolIds: Array<string>) => void;
  chat?: ChatResponse;
  disabled?: boolean;
  isToolPermissionsEnabled?: boolean;
}

export function ChatSettingsSheet({
  tools,
  selectedToolIds,
  onApplyToolIds,
  chat,
  disabled,
  isToolPermissionsEnabled,
}: ChatSettingsSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.CHAT_SETTINGS_SHEET');
  const modalRef = useRef<BottomSheetModal>(null);
  const systemPromptSheetRef = useRef<SystemPromptSheetMethods>(null);
  const toolsSheetRef = useRef<ToolsSheetMethods>(null);

  const { systemPrompt, saveSystemPrompt } = useChatSystemPrompt({ chat });
  const hasSystemPrompt = !!systemPrompt;

  const approvalMode = useSelector(toolApprovalState$.mode);
  const isFullAccess = approvalMode === ToolApprovalMode.FULL;

  const closeMenu = (): void => modalRef.current?.close();

  const handleSystemPromptRowPress = (): void => {
    systemPromptSheetRef.current?.present(systemPrompt);
  };

  const handleToolsRowPress = (): void => {
    closeMenu();
    toolsSheetRef.current?.present();
  };

  const handleFullAccessChange = (value: boolean): void => {
    toolApprovalState$.mode.set(value ? ToolApprovalMode.FULL : ToolApprovalMode.ASK);
  };

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <SelectOptionIcon
      iconName='moreDotsInCircle'
      onPress={onPress}
      isSelected={selectedToolIds.length > 0 || hasSystemPrompt || (!!isToolPermissionsEnabled && !isFullAccess)}
      disabled={disabled}
    />
  );

  return (
    <Fragment>
      <AppBottomSheet
        isModal
        ref={modalRef}
        renderTrigger={renderTrigger}
        enablePanDownToClose={false}
        withoutBackground
        content={
          <View>
            <View className='rounded-2xl overflow-hidden'>
              <ActionSheetItem
                title={translate('TEXT_SYSTEM_PROMPT')}
                value={hasSystemPrompt ? systemPrompt : translate('TEXT_SYSTEM_PROMPT_PLACEHOLDER')}
                iconName='console'
                hasSubActions
                onPress={handleSystemPromptRowPress}
              />
              <ActionSheetItem
                title={translate('TEXT_TOOLS')}
                iconName='tools'
                hasSubActions
                onPress={handleToolsRowPress}
              />
              {isToolPermissionsEnabled && (
                <View className='bg-background-primary px-24 py-20 gap-12 flex-row items-center justify-between'>
                  <View className='flex-row items-center gap-12'>
                    <View className='h-24 w-24'>
                      <Icon name='shieldTick' />
                    </View>
                    <AppText className='text-md-sm sm:text-md'>{translate('TEXT_FULL_ACCESS_FOR_TOOLS')}</AppText>
                  </View>
                  <AppSwitch value={isFullAccess} onValueChange={handleFullAccessChange} />
                </View>
              )}
            </View>
            <ActionSheetItem
              isCentered
              title={translate('BUTTON_CLOSE')}
              onPress={closeMenu}
              className='mt-16 rounded-2xl'
            />
          </View>
        }
      />
      <SystemPromptSheet
        ref={systemPromptSheetRef}
        onSave={saveSystemPrompt}
        onClose={() => modalRef.current?.present()}
      />
      <ToolsSheet
        ref={toolsSheetRef}
        tools={tools}
        selectedToolIds={selectedToolIds}
        onApplyToolIds={onApplyToolIds}
        onDismiss={() => modalRef.current?.present()}
      />
    </Fragment>
  );
}
