import { ReactElement } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppPressableProps,
  AppText,
  Icon,
  IconButton,
  IconName,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

interface AttachedKnowledgeProps extends AppPressableProps {
  index: number;
  title: string;
  subTitle: string;
  iconName: IconName;
  onDeletePress?: (id: number) => void;
}

export function AttachedKnowledge({
  index,
  title,
  subTitle,
  iconName,
  className,
  onDeletePress,
  ...restProps
}: AttachedKnowledgeProps): ReactElement {
  return (
    <AppPressable
      className={cn('rounded-lg flex-row bg-background-secondary items-center py-6 px-12', className)}
      {...restProps}>
      <Icon name={iconName} className='color-text-primary mr-16' />
      <View className='flex-1 flex-col justify-between'>
        <AppText className='text-md-sm sm:text-md'>{title}</AppText>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{subTitle}</AppText>
      </View>
      {onDeletePress && (
        <IconButton
          iconName='closeSM'
          hitSlop={8}
          onPress={() => onDeletePress(index)}
          className='rounded-full bg-background-primary w-24 h-24 p-0 items-center justify-center'
          iconProps={{ className: 'color-text-primary', width: 8 }}
        />
      )}
    </AppPressable>
  );
}
