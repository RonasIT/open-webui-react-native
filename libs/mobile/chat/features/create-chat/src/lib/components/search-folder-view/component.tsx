import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { useColorScheme } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppText,
  FullScreenSearchListItem,
  FullScreenSearchModal,
  FullScreenSearchModalProps,
  Icon,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { FolderListItem, foldersApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

interface SearchFolderViewProps
  extends Omit<FullScreenSearchModalProps<FolderListItem>, 'searchPlaceholder' | 'data' | 'renderTrigger'> {
  onCreateFolderPress: () => void;
  disabled?: boolean;
}

const createFolderId = 'create-folder-id';

export function SearchFolderView({
  selectedItemId,
  onCreateFolderPress,
  disabled,
  ...props
}: SearchFolderViewProps): ReactElement {
  const translate = useTranslation('CHAT.CREATE_CHAT.SEARCH_FOLDER_VIEW');
  const { isDarkColorScheme } = useColorScheme();

  const emptyFolders = [
    {
      id: undefined,
      name: translate('TEXT_NO_FOLDER'),
      iconName: isDarkColorScheme ? 'logoSmallDark' : 'logoSmallLight',
    },
    {
      id: createFolderId,
      name: translate('TEXT_CREATE_NEW_FOLDER'),
      onPress: onCreateFolderPress,
      iconName: 'folderPlus',
      containerClassName: 'mb-24',
      textClassName: 'text-brand-primary',
      iconClassName: 'color-brand-primary',
    },
  ] as Array<FullScreenSearchListItem>;

  const { data: folders } = foldersApi.useGetFolders();

  const selectedFolderName = folders?.find((folder) => folder.id === selectedItemId)?.name;

  const foldersWithIcon = folders?.map((folder) => ({ ...folder, iconName: 'folder' }));

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
        unfilteredData={emptyFolders as Array<FolderListItem>}
        selectedItemId={selectedItemId}
        renderTrigger={renderTrigger}
        searchPlaceholder={translate('TEXT_SEARCH_FOLDER')}
        {...props}
      />
    </View>
  );
}
