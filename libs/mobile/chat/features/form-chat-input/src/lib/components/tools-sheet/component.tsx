import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { xor } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppSwitch, AppText, SearchableListBottomSheet, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Tool } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';

export type ToolsSheetMethods = {
  present: () => void;
};

export type ToolsSheetRef = ForwardedRef<ToolsSheetMethods>;

export interface ToolsSheetProps {
  ref?: ToolsSheetRef;
  tools: Array<Tool>;
  selectedToolIds: Array<string>;
  onApplyToolIds: (toolIds: Array<string>) => void;
  onDismiss?: () => void;
}

export function ToolsSheet({ ref, tools, selectedToolIds, onApplyToolIds, onDismiss }: ToolsSheetProps): ReactElement {
  const translate = useTranslation('CHAT.FORM_CHAT_INPUT.TOOLS_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const { query, setQuery } = useDebouncedQuery();

  const [draftToolIds, setDraftToolIds] = useState<Array<string>>(selectedToolIds);

  const closeModal = (): void => {
    sheetRef.current?.close();
  };

  useImperativeHandle(
    ref,
    () => ({
      present: (): void => {
        setQuery('');
        setDraftToolIds(selectedToolIds);
        sheetRef.current?.present();
      },
    }),
    [selectedToolIds],
  );

  const handleToolToggle = (toolId: string): void => {
    setDraftToolIds((current) => xor(current, [toolId]));
  };

  const handleApply = (): void => {
    onApplyToolIds(draftToolIds);
    closeModal();
  };

  const filteredTools = tools.filter((tool) => tool.name.toLowerCase().includes(query.toLowerCase()));

  const renderItem = ({ item }: { item: Tool }): ReactElement => {
    const isSignInRequired = item.authenticated === false;

    return (
      <View className='py-12 gap-16 flex-row items-center'>
        <AppText numberOfLines={1} className={cn('flex-1', isSignInRequired && 'opacity-40')}>
          {isSignInRequired ? translate('TEXT_SIGN_IN_REQUIRED', { name: item.name }) : item.name}
        </AppText>
        <AppSwitch
          value={draftToolIds.includes(item.id)}
          onValueChange={() => handleToolToggle(item.id)}
          disabled={isSignInRequired}
        />
      </View>
    );
  };

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_TITLE')}
      onGoBack={closeModal}
      onDismiss={() => {
        setQuery('');
        onDismiss?.();
      }}
      headerProps={{ onConfirmPress: handleApply }}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_TOOLS')}
      emptyDescription={query ? translate('TEXT_NOTHING_FOUND') : translate('TEXT_NO_TOOLS_AVAILABLE')}
      data={filteredTools}
      extraData={draftToolIds}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
    />
  );
}
