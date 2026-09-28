import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useRef } from 'react';
import {
  ActionSheetItem,
  ActionSheetItemProps,
  AppBottomSheet,
  AppText,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatResponse, Tool } from '@open-webui-react-native/shared/data-access/api';
import { useChatSystemPrompt } from '../../hooks';
import { SelectOptionIcon } from '../select-option-icon';
import { SystemPromptSheet, SystemPromptSheetMethods } from '../system-prompt-sheet';

export interface ToolsMenuSheetProps {
  tools: Array<Tool>;
  selectedToolIds: Array<string>;
  onToolPress: (toolId: string) => void;
  chat?: ChatResponse;
  disabled?: boolean;
}

export function ToolsMenuSheet({
  tools,
  selectedToolIds,
  onToolPress,
  chat,
  disabled,
}: ToolsMenuSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.TOOLS_POPUP');
  const modalRef = useRef<BottomSheetModal>(null);
  const systemPromptSheetRef = useRef<SystemPromptSheetMethods>(null);

  const { systemPrompt, saveSystemPrompt } = useChatSystemPrompt({ chat });
  const hasSystemPrompt = !!systemPrompt;

  const closeMenu = (): void => modalRef.current?.close();

  // The sheet stays open after a tap so several tools can be toggled in one go.
  const actions: Array<ActionSheetItemProps> = tools.map((tool) => {
    // Signing into an OAuth-protected server happens in the web interface, so the app can only
    // show that the tool is unusable until then. The reason goes into the title because a greyed
    // out row on its own reads as a bug rather than as a step the user still has to take.
    const isSignInRequired = tool.authenticated === false;

    return {
      title: isSignInRequired ? translate('TEXT_SIGN_IN_REQUIRED', { name: tool.name }) : tool.name,
      iconName: 'tick',
      isIconShown: selectedToolIds.includes(tool.id),
      disabled: isSignInRequired,
      onPress: () => onToolPress(tool.id),
    };
  });

  const handleSystemPromptRowPress = (): void => {
    systemPromptSheetRef.current?.present(systemPrompt);
  };

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <SelectOptionIcon
      iconName='tools'
      onPress={onPress}
      isSelected={selectedToolIds.length > 0 || hasSystemPrompt}
      disabled={disabled}
    />
  );

  const renderSectionTitle = (title: string): ReactElement => (
    <AppText className='px-16 pb-4 pt-4 text-sm-sm sm:text-sm text-text-secondary'>{title}</AppText>
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
            <View className='bg-background-primary rounded-t-2xl'>
              {renderSectionTitle(translate('TEXT_TOOLS_SECTION'))}
              <View className='rounded-2xl overflow-hidden'>
                {(actions.length ? actions : [{ title: translate('TEXT_NO_TOOLS_AVAILABLE'), disabled: true }]).map(
                  ({ disabled: itemDisabled, isLoading, ...action }) => (
                    <ActionSheetItem
                      key={action.title}
                      disabled={itemDisabled || isLoading}
                      isLoading={isLoading}
                      {...action}
                    />
                  ),
                )}
              </View>
            </View>
            <View className='bg-background-primary rounded-b-2xl'>
              {renderSectionTitle(translate('TEXT_SYSTEM_PROMPT_SECTION'))}
              <View className='rounded-2xl overflow-hidden'>
                <ActionSheetItem
                  title={hasSystemPrompt ? systemPrompt : translate('TEXT_SYSTEM_PROMPT_PLACEHOLDER')}
                  hasSubActions
                  onPress={handleSystemPromptRowPress}
                  numberOfLines={1}
                />
              </View>
            </View>
            <ActionSheetItem
              isCentered
              title={translate('BUTTON_APPLY')}
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
    </Fragment>
  );
}
