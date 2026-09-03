import { ReactElement } from 'react';
import { FolderRow } from '@open-webui-react-native/mobile/chat/ui/folder-row';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FolderListItem } from '@open-webui-react-native/shared/data-access/api';

export interface FoldersListProps {
  folders: Array<FolderListItem>;
  title: string;
  onFolderPress: (id: string, name: string) => void;
  onFolderLongPress?: (folder: FolderListItem) => void;
}

export function FoldersList({ folders, title, onFolderPress, onFolderLongPress }: FoldersListProps): ReactElement {
  // NOTE: Workaround to fix a bug where a line would disappear if there was only one element in the list
  const className = folders.length === 1 ? 'min-h-[52px]' : undefined;

  if (!folders.length) {
    return <View />;
  }

  return (
    <View>
      <AppText className='px-16 py-10 text-md-sm sm:text-sm text-text-secondary'>{title}</AppText>
      <View className={className}>
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            name={folder.name}
            onPress={() => onFolderPress(folder.id, folder.name)}
            onLongPress={onFolderLongPress ? () => onFolderLongPress(folder) : undefined}
          />
        ))}
      </View>
    </View>
  );
}
