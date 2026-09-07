import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import {
  FolderSearchItem,
  useFolderSearchList,
} from '@open-webui-react-native/mobile/chat/utils/use-folder-search-list';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppText,
  FullScreenSearchModal,
  FullScreenSearchModalProps,
  Icon,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AccessPermission, FolderListItem, foldersApi } from '@open-webui-react-native/shared/data-access/api';

interface SearchFolderViewProps extends Omit<
  FullScreenSearchModalProps<FolderListItem>,
  'searchPlaceholder' | 'data' | 'renderTrigger'
> {
  onCreateFolderPress: () => void;
  disabled?: boolean;
}

export function SearchFolderView({
  selectedItemId,
  onCreateFolderPress,
  disabled,
  ...props
}: SearchFolderViewProps): ReactElement {
  const translate = useTranslation('CHAT.CREATE_CHAT.SEARCH_FOLDER_VIEW');
  const { isDarkColorScheme } = useColorScheme();

  const { emptyFolders } = useFolderSearchList({
    noFolderText: translate('TEXT_NO_FOLDER'),
    createFolderText: translate('TEXT_CREATE_NEW_FOLDER'),
    onCreateFolderPress,
  });

  const { data: folders } = foldersApi.useGetFolders();
  const { data: sharedFolders } = foldersApi.useGetSharedFolders();

  // NOTE: A chat can be created in a folder shared by somebody else only with a write grant, so
  // read-only ones are left out. Without them the folder opened from its own screen resolved to no
  // name at all and the trigger read "No folder".
  const availableFolders = [
    ...(folders ?? []),
    ...(sharedFolders ?? []).filter((folder) => folder.permission === AccessPermission.WRITE),
  ];

  const selectedFolderName = availableFolders.find((folder) => folder.id === selectedItemId)?.name;

  const foldersWithIcon = availableFolders.map((folder) => ({ ...folder, iconName: 'folder' }));

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <AppPressable
      className='flex-row items-center px-content-offset'
      onPress={onPress}
      disabled={disabled}>
      <AppText numberOfLines={1} className='text-h3-sm sm:text-h3 font-medium mr-8 max-w-[90%]'>
        {selectedFolderName || translate('TEXT_NO_FOLDER')}
      </AppText>
      {!disabled && <Icon name='chevronDown' />}
    </AppPressable>
  );

  const FolderIcon = (): ReactElement => (
    <View className='w-[60px] h-[60px] bg-background-secondary justify-center items-center rounded-full'>
      <Icon name='folder' />
    </View>
  );

  return (
    <View className='gap-16 pb-40 items-center justify-center'>
      {selectedItemId ? (
        <FolderIcon />
      ) : (
        <Icon
          name={isDarkColorScheme ? 'logoDark' : 'logoLight'}
          width={60}
          height={60} />
      )}
      <FullScreenSearchModal
        data={foldersWithIcon || []}
        unfilteredData={emptyFolders as Array<FolderSearchItem>}
        selectedItemId={selectedItemId}
        renderTrigger={renderTrigger}
        searchPlaceholder={translate('TEXT_SEARCH_FOLDER')}
        {...props}
      />
    </View>
  );
}
