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
import { InteractionManager } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
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
  ref?: FullScreenSearchModalRef;
}

export function FullScreenSearchModal<Item extends FullScreenSearchListItem>({
  data,
  searchPlaceholder,
  renderTrigger,
  onSelectItem,
  unfilteredData,
  selectedItemId,
  modalComponent,
  ref,
}: FullScreenSearchModalProps<Item>): ReactElement {
  const listRef = useRef<React.ComponentRef<typeof FlashList<Item>>>(null);
  const bottomInset = useBottomInset();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimationCompleted, setIsAnimationCompleted] = useState<boolean>(false);

  const { query, setQuery } = useDebouncedQuery();

  const close = (): void => {
    setIsOpen(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      present: (): void => {
        setIsOpen(true);
      },
      close,
    }),
    [],
  );

  const filteredData = (data ?? []).filter((item) => new RegExp(query, 'i').test(item.name));

  const combinedData = unfilteredData ? [...unfilteredData, ...filteredData] : filteredData;

  const toggleAnimationCompleted = (): void => {
    InteractionManager.runAfterInteractions(() => setIsAnimationCompleted((prev) => !prev));
  };

  //NOTE Needs to scroll to selected item after bottom sheet opens
  const handleOpen = (): void => {
    setIsOpen(true);
    const index = (combinedData ?? []).findIndex((item) => item.id === selectedItemId);

    if (combinedData.length > 0) {
      //NOTE Scroll cannot be triggered immediately, because bottom sheet is not fully opened yet
      delay(() => {
        if (index === combinedData.length - 1) {
          listRef.current?.scrollToEnd({ animated: true });
        } else listRef.current?.scrollToIndex({ index: index, animated: true });
      }, 300);
    }
  };

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
        setIsOpen(false);
      }
    },
    [onSelectItem],
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
          containerClassName={item.containerClassName}
          iconClassName={item.iconClassName}
          textClassName={item.textClassName}
        />
      );
    },
    [handleSelectItem, selectedItemId],
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
              <AnimatedView className='flex-1' entering={FadeIn.duration(50)}>
                <AppFlashList
                  ref={listRef as Ref<React.ComponentRef<typeof FlashList<Item>>>}
                  extraData={query}
                  contentContainerClassName='pt-24'
                  contentContainerStyle={{ paddingBottom: bottomInset }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'
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
