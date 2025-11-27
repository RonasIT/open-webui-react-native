import { ReactElement } from 'react';
import { AppPressable, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface SourceCitationItemProps {
  index: number;
  fileName?: string;
  onPress: () => void;
}

export function SourceCitationItem({ index, fileName, onPress }: SourceCitationItemProps): ReactElement {
  return (
    <AppPressable
      onPress={onPress}
      className='flex-row max-w-[50%] active:bg-background-secondary gap-4 p-4 rounded-2xl items-center'>
      <View className='rounded-xl items-center justify-center bg-background-tertiary px-8 py-[2]'>
        <AppText className='font-medium text-sm-sm sm:text-sm'>{index + 1}</AppText>
      </View>
      <AppText numberOfLines={1} className='font-medium text-sm-sm sm:text-sm flex-shrink'>
        {fileName}
      </AppText>
    </AppPressable>
  );
}
