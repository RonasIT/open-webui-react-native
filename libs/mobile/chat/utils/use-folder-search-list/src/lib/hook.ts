import { useMemo } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MockFolderItemIds } from '@open-webui-react-native/shared/data-access/api';
import { FolderSearchItem } from './types';

interface UseFolderSearchListParams {
  noFolderText: string;
  createFolderText: string;
  onCreateFolderPress: () => void;
}

interface UseFolderSearchListResult {
  emptyFolders: Array<FolderSearchItem>;
  createFolderId: string;
}

export function useFolderSearchList({
  noFolderText,
  createFolderText,
  onCreateFolderPress,
}: UseFolderSearchListParams): UseFolderSearchListResult {
  const { isDarkColorScheme } = useColorScheme();

  const emptyFolders = useMemo(
    () => [
      {
        id: MockFolderItemIds.NO_FOLDER_ID,
        name: noFolderText,
        iconName: isDarkColorScheme ? ('logoSmallDark' as IconName) : ('logoSmallLight' as IconName),
      },
      {
        id: MockFolderItemIds.CREATE_FOLDER_ID,
        name: createFolderText,
        onPress: onCreateFolderPress,
        iconName: 'folderPlus' as IconName,
        containerClassName: 'mb-24',
        textClassName: 'text-brand-primary',
        iconClassName: 'color-brand-primary',
      },
    ],
    [isDarkColorScheme, noFolderText, createFolderText, onCreateFolderPress],
  );

  return { emptyFolders, createFolderId: MockFolderItemIds.CREATE_FOLDER_ID };
}
