import { useMemo } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';

export const CREATE_FOLDER_ID = 'create-folder-id';

interface UseFolderSearchListParams {
  noFolderText: string;
  createFolderText: string;
  onCreateFolderPress: () => void;
}

export function useFolderSearchList({
  noFolderText,
  createFolderText,
  onCreateFolderPress,
}: UseFolderSearchListParams) {
  const { isDarkColorScheme } = useColorScheme();

  const emptyFolders = useMemo(
    () => [
      {
        id: undefined,
        name: noFolderText,
        iconName: isDarkColorScheme ? 'logoSmallDark' : 'logoSmallLight',
      },
      {
        id: CREATE_FOLDER_ID,
        name: createFolderText,
        onPress: onCreateFolderPress,
        iconName: 'folderPlus',
        containerClassName: 'mb-24',
        textClassName: 'text-brand-primary',
        iconClassName: 'color-brand-primary',
      },
    ],
    [isDarkColorScheme, noFolderText, createFolderText, onCreateFolderPress],
  );

  return { emptyFolders, createFolderId: CREATE_FOLDER_ID };
}
