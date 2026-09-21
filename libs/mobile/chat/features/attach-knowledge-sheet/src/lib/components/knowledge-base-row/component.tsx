import { ReactElement } from 'react';
import { AppPressable, AppText, Icon, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge } from '@open-webui-react-native/shared/data-access/api';

export interface KnowledgeBaseRowProps {
  item: Knowledge;
  isSelected: boolean;
  onPress: () => void;
  onShowFilesPress: () => void;
}

export function KnowledgeBaseRow({ item, isSelected, onPress, onShowFilesPress }: KnowledgeBaseRowProps): ReactElement {
  return (
    <AppPressable onPress={onPress} className='py-12 gap-16 flex-row items-center justify-between'>
      <Icon name={item.isDocument ? 'file' : 'database'} />
      <View className='flex-1 gap-4'>
        <AppText>{item.name}</AppText>
        <AppText className='text-sm-sm sm:text-sm'>{item.description}</AppText>
      </View>
      {isSelected && <Icon name='tick' />}
      <IconButton
        iconName='chevronRight'
        onPress={onShowFilesPress}
        hitSlop={8}
        className='p-0' />
    </AppPressable>
  );
}
