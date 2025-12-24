import { ReactElement } from 'react';
import { AppPressable, AppText, Icon } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface FolderRowProps {
  name: string;
  onPress: () => void;
  onLongPress: () => void;
}

export function FolderRow({ name, onPress, onLongPress }: FolderRowProps): ReactElement {
  return (
    <AppPressable
      onPress={onPress}
      onLongPress={onLongPress}
      className='px-16 py-14 flex-1 flex-row gap-8 justify-between items-center'>
      <AppText className='text-text-secondary max-w-[90%]'>{name}</AppText>
      <Icon name='chevronRight' className='color-text-secondary' />
    </AppPressable>
  );
}
