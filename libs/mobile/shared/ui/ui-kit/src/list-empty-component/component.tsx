import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText } from '../text';
import { View } from '../view';

export interface ListEmptyComponentProps {
  description: string;
  descriptionClassName?: string;
  containerClassName?: string;
}

export function ListEmptyComponent({
  description,
  descriptionClassName,
  containerClassName,
}: ListEmptyComponentProps): ReactElement {
  return (
    <View className={cn('justify-center items-center', containerClassName)}>
      <AppText className={cn('text-text-tertiary', descriptionClassName)}>{description}</AppText>
    </View>
  );
}
