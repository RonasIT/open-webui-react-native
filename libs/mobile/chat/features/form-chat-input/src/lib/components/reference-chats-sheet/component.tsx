import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef } from 'react';
import { SearchableListBottomSheet } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi, ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { ReferenceChatRow } from './components';

export type ReferenceChatsSheetMethods = {
  present: () => void;
};

export type ReferenceChatsSheetRef = ForwardedRef<ReferenceChatsSheetMethods>;

export interface ReferenceChatsSheetProps {
  ref?: ReferenceChatsSheetRef;
  chatId?: string;
  attachedChatIds: Array<string>;
  onSelectChat: (chat: ChatListItem) => void;
}

export function ReferenceChatsSheet({
  ref,
  chatId,
  attachedChatIds,
  onSelectChat,
}: ReferenceChatsSheetProps): ReactElement {
  const translate = useTranslation('CHAT.REFERENCE_CHATS_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });

  // NOTE: The search screen omits folder and pinned chats. This picker needs both, otherwise a
  // chat that lives in a folder cannot be attached.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = chatApi.useSearchInfinite(
    debouncedQuery,
    { includeFolders: true, includePinned: true },
  );

  const closeModal = (): void => {
    sheetRef.current?.close();
  };

  const openModal = (): void => {
    setQuery('');
    sheetRef.current?.present();
  };

  useImperativeHandle(ref, () => ({ present: openModal }), []);

  const handleFetchNextPage = (): void => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const chats = (data ?? []).filter((chat) => chat.id !== chatId);

  const renderItem = ({ item }: { item: ChatListItem }): ReactElement => {
    const handlePress = (): void => {
      if (attachedChatIds.includes(item.id)) {
        return;
      }

      onSelectChat(item);
      closeModal();
    };

    return <ReferenceChatRow
      item={item}
      isSelected={attachedChatIds.includes(item.id)}
      onPress={handlePress} />;
  };

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_TITLE')}
      onGoBack={closeModal}
      onDismiss={() => setQuery('')}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_CHATS')}
      isLoading={isLoading}
      emptyDescription={translate('TEXT_NO_CHATS')}
      data={chats}
      extraData={attachedChatIds}
      showsVerticalScrollIndicator={false}
      pagination={{ onEndReached: handleFetchNextPage, isFetchingNextPage }}
      renderItem={renderItem}
    />
  );
}
