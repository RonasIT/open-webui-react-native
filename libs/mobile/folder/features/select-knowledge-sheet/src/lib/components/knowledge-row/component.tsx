import { ReactElement } from 'react';
import { AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge } from '@open-webui-react-native/shared/data-access/api';

export interface KnowledgeRowProps {
  item: Knowledge;
  onPress: () => void;
  isSelected: boolean;
}

export function KnowledgeRow({ item, onPress, isSelected }: KnowledgeRowProps): ReactElement {
  return (
    <AppPressable onPress={onPress} className='px-16 py-12 gap-16 flex-row items-center justify-between'>
      <Icon name={item.isDocument ? 'file' : 'database'} />
      <View className='flex-1 gap-4'>
        <AppText>{item.name}</AppText>
        <AppText className='text-sm-sm sm:text-sm'>{item.description}</AppText>
      </View>
      {isSelected && <Icon name='tick' />}
    </AppPressable>
  );
}
