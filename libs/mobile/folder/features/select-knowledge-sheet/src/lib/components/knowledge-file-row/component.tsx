import { ReactElement } from 'react';
import { AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileData } from '@open-webui-react-native/shared/data-access/common';

export interface KnowledgeFileRowProps {
  item: FileData;
  onPress: () => void;
  isSelected: boolean;
}

export function KnowledgeFileRow({ item, onPress, isSelected }: KnowledgeFileRowProps): ReactElement {
  return (
    <AppPressable onPress={onPress} className='py-12 gap-16 flex-row items-center justify-between'>
      <Icon name='file' />
      <View className='flex-1 gap-4'>
        <AppText>{item.filename}</AppText>
      </View>
      {isSelected && <Icon name='tick' />}
    </AppPressable>
  );
}
