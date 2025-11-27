import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import dayjs from 'dayjs';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  UpsertFolderSheet,
  UpsertFolderSheetMethods,
} from '@open-webui-react-native/mobile/folder/features/upsert-folder-sheet';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppFlashList,
  AppSafeAreaView,
  AppSpinner,
  AppToast,
  IconName,
  ListEmptyComponent,
  SearchInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi, FolderListItem, foldersApi } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { SelectFolderRow } from './components';

export type MoveToFolderModalMethods = {
  present: ({ chatId }: { chatId: string }) => Promise<void>;
  close: () => Promise<void>;
};

export type MoveToFolderModalRef = ForwardedRef<MoveToFolderModalMethods>;

export interface MoveToFolderModalProps extends Partial<ModalProps> {
  onFolderSelected: (folderId: string | null, oldFolderId: string | null) => void;
  ref: MoveToFolderModalRef;
}

export function MoveToFolderModal({ onFolderSelected, ref, ...props }: MoveToFolderModalProps): ReactElement {
  const translate = useTranslation('FOLDER.MOVE_TO_FOLDER_SHEET');
  const { isDarkColorScheme } = useColorScheme();
  const upsertFolderSheetRef = useRef<UpsertFolderSheetMethods>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [chatId, setChatId] = useState<string>();
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const { query, setQuery } = useDebouncedQuery({ delay: 300 });

  const close = async (): Promise<void> => {
    setIsVisible(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      present: async ({ chatId }: { chatId: string }): Promise<void> => {
        setChatId(chatId);
        setIsVisible(true);
      },
      close,
    }),
    [],
  );

  const { data: folders, isLoading: isFoldersLoading } = foldersApi.useGetFolders();
  const { data: chat, isLoading: isChatLoading } = chatApi.useGet(chatId ?? '', { enabled: !!chatId });

  const oldFolderId = chat?.folderId ?? null;
  const filteredFolders = (folders ?? []).filter((folder) => folder.name.toLowerCase().includes(query.toLowerCase()));

  const isLoading = isFoldersLoading || isChatLoading;

  const noFolderItem = new FolderListItem({
    id: '',
    name: translate('TEXT_NO_FOLDER'),
    parentId: '',
    isExpanded: false,
    updatedAt: dayjs(),
    createdAt: dayjs(),
  });

  const createFolderItem = new FolderListItem({
    id: 'create',
    name: translate('TEXT_CREATE_FOLDER'),
    parentId: '',
    isExpanded: false,
    updatedAt: dayjs(),
    createdAt: dayjs(),
  });

  const handleCreateFolder = (): void => {
    setIsVisible(false);
    upsertFolderSheetRef.current?.present();
  };

  const specialFolderItems: Record<
    string,
    {
      icon: IconName;
      iconClassName?: string;
      textClassName?: string;
      onPress?: () => void;
    }
  > = {
    create: {
      icon: 'folderPlus',
      iconClassName: 'color-brand-primary',
      textClassName: 'color-brand-primary',
      onPress: handleCreateFolder,
    },
    '': {
      icon: isDarkColorScheme ? 'logoSmallDark' : 'logoSmallLight',
    },
  };

  const getSpecialItemConfig = (item: FolderListItem) => specialFolderItems[item.id];

  const renderItem = ({ item }: { item: FolderListItem }): ReactElement => {
    const special = getSpecialItemConfig(item);
    const isSelected = selectedFolderId === item.id;

    const onPress = (): void => {
      if (special?.onPress) special.onPress();
      else {
        setSelectedFolderId(item.id);
        onFolderSelected(item.id, oldFolderId);
      }
    };

    return (
      <SelectFolderRow
        item={item}
        onPress={onPress}
        isSelected={isSelected}
        iconName={special?.icon}
        iconClassName={special?.iconClassName ?? ''}
        textClassName={special?.textClassName ?? ''}
      />
    );
  };

  useEffect(() => {
    if (chat) {
      setSelectedFolderId(chat.folderId ?? '');
    }
  }, [chat]);

  return (
    <View>
      <Modal
        isVisible={isVisible}
        hideModalContentWhileAnimating={true}
        backdropColor={isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary}
        backdropOpacity={1}
        backdropTransitionOutTiming={1}
        animationOutTiming={1}
        animationIn='fadeIn'
        {...props}>
        <AppSafeAreaView edges={['top', 'bottom']} className='flex-1'>
          <SearchInput
            onCancel={close}
            value={query}
            className={'pt-0'}
            placeholder={translate('TEXT_SEARCH_FOLDERS')}
            onChangeText={setQuery}
          />
          {isLoading ? (
            <View className='flex-1 items-center justify-center'>
              <AppSpinner />
            </View>
          ) : (
            <AppFlashList
              renderItem={renderItem}
              data={[noFolderItem, createFolderItem, ...filteredFolders]}
              ListEmptyComponent={
                <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NO_FOLDERS')} />
              }
            />
          )}
        </AppSafeAreaView>
        <AppToast />
      </Modal>
      <UpsertFolderSheet ref={upsertFolderSheetRef} />
    </View>
  );
}
