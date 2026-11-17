import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { delay } from 'lodash-es';
import React, {
  ForwardedRef,
  Fragment,
  ReactElement,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { InteractionManager, RefreshControlProps } from 'react-native';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MockFolderItemIds } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { AppFlashList } from '../flash-list';
import { FullScreenModal } from '../full-screen-modal';
import { AppKeyboardControllerView } from '../keyboard-controller-view';
import { SearchInput } from '../search-input';
import { AnimatedView, View } from '../view';
import { ListItem } from './components';
import { FullScreenSearchListItem } from './types';

export type FullScreenSearchModalMethods = {
  present: () => void;
  close: () => void;
};

export type FullScreenSearchModalRef = ForwardedRef<FullScreenSearchModalMethods>;

export interface FullScreenSearchModalProps<Item extends FullScreenSearchListItem> {
  data: Array<Item>;
  searchPlaceholder: string;
  onSelectItem: (id: string) => void;
  renderTrigger?: (props: { onPress: () => void }) => ReactElement;
  unfilteredData?: Array<Item>;
  selectedItemId?: string;
  modalComponent?: ReactElement;
  refreshControl?: ReactElement<RefreshControlProps>;
  ref?: FullScreenSearchModalRef;
  // NOTE: Items look disabled but stay pressable, so onSelectItem can tell the user why (e.g. the offline toast).
  areItemsInactive?: boolean;
}

export function FullScreenSearchModal<Item extends FullScreenSearchListItem>({
  data,
  searchPlaceholder,
  renderTrigger,
  onSelectItem,
  unfilteredData,
  selectedItemId,
  modalComponent,
  refreshControl,
  ref,
  areItemsInactive,
}: FullScreenSearchModalProps<Item>): ReactElement {
  const listRef = useRef<React.ComponentRef<typeof FlashList<Item>>>(null);
  const bottomInset = useBottomInset();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimationCompleted, setIsAnimationCompleted] = useState<boolean>(false);

  const { query, setQuery } = useDebouncedQuery();

  const close = (): void => {
    setIsOpen(false);
  };

  const filteredData = (data ?? []).filter((item) => new RegExp(query, 'i').test(item.name));

  const combinedData = unfilteredData ? [...unfilteredData, ...filteredData] : filteredData;

  const toggleAnimationCompleted = (): void => {
    InteractionManager.runAfterInteractions(() => setIsAnimationCompleted((prev) => !prev));
  };

  //NOTE Needs to scroll to selected item after bottom sheet opens
  const handleOpen = (): void => {
    setIsOpen(true);
    const index = (combinedData ?? []).findIndex((item) => item.id === selectedItemId);

    //NOTE The selected item may be absent from the list, so there is nothing to scroll to
    if (index >= 0) {
      //NOTE Scroll cannot be triggered immediately, because bottom sheet is not fully opened yet
      delay(() => {
        if (index === combinedData.length - 1) {
          listRef.current?.scrollToEnd({ animated: true });
        } else listRef.current?.scrollToIndex({ index: index, animated: true });
      }, 300);
    }
  };

  //NOTE No deps: present must see the current data and selected item to scroll to it
  useImperativeHandle(ref, () => ({ present: handleOpen, close }));

  const handleCancel = (): void => {
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectItem = useCallback(
    (id: string, onPress?: (id: string) => void): void => {
      if (onPress) {
        onPress(id);
      } else {
        onSelectItem(id);

        // NOTE: An inactive selection is rejected by onSelectItem, so the modal stays open.
        if (!areItemsInactive) {
          setIsOpen(false);
        }
      }
    },
    [onSelectItem, areItemsInactive],
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) => {
      const isNoFolderSelected = selectedItemId === null && item.id === MockFolderItemIds.NO_FOLDER_ID;

      return (
        <ListItem
          isSelected={selectedItemId === item.id || isNoFolderSelected}
          onSelect={() => handleSelectItem(item.id, item.onPress)}
          name={item.name}
          iconName={item.iconName}
          containerClassName={cn(item.containerClassName, areItemsInactive && 'opacity-30')}
          iconClassName={item.iconClassName}
          textClassName={item.textClassName}
        />
      );
    },
    [handleSelectItem, selectedItemId, areItemsInactive],
  );

  return (
    <Fragment>
      {renderTrigger && renderTrigger({ onPress: handleOpen })}
      <FullScreenModal
        avoidKeyboard={false}
        onModalWillShow={toggleAnimationCompleted}
        onModalHide={toggleAnimationCompleted}
        isVisible={isOpen}>
        <View className='flex-1 pt-safe bg-background-primary px-content-offset'>
          <SearchInput
            value={query}
            onCancel={handleCancel}
            onChangeText={setQuery}
            placeholder={searchPlaceholder} />
          <AppKeyboardControllerView keyboardVerticalOffset={0}>
            {isAnimationCompleted && (
              <AnimatedView className='flex-1'>
                <AppFlashList
                  ref={listRef as Ref<React.ComponentRef<typeof FlashList<Item>>>}
                  extraData={query}
                  contentContainerClassName='pt-24'
                  contentContainerStyle={{ paddingBottom: bottomInset }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'
                  refreshControl={refreshControl}
                  renderItem={renderItem}
                  data={combinedData}
                />
              </AnimatedView>
            )}
          </AppKeyboardControllerView>
          <BottomSheetModalProvider>{modalComponent}</BottomSheetModalProvider>
        </View>
      </FullScreenModal>
    </Fragment>
  );
}
