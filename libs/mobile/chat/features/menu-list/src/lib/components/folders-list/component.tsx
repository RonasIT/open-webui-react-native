import { ReactElement } from 'react';
import { FolderRow } from '@open-web-ui-mobile-client-react-native/mobile/chat/ui/folder-row';
import { View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { FolderListItem } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

export interface FoldersListProps {
  folders: Array<FolderListItem>;
  onFolderPress: (id: string, name: string) => void;
  onFolderLongPress: (folder: FolderListItem) => void;
}

export function FoldersList({ folders, onFolderPress, onFolderLongPress }: FoldersListProps): ReactElement {
  // NOTE: Workaround to fix a bug where a line would disappear if there was only one element in the list
  const className = folders.length === 1 ? 'min-h-[52px]' : undefined;

  return (
    <View className={className}>
      {folders.map((folder) => (
        <FolderRow
          key={folder.id}
          name={folder.name}
          onPress={() => onFolderPress(folder.id, folder.name)}
          onLongPress={() => onFolderLongPress(folder)}
        />
      ))}
    </View>
  );
}
