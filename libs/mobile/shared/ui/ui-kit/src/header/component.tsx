import { ReactElement } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { IconButton } from '../icon-button';
import { AppText } from '../text';
import { View, ViewProps } from '../view';

export interface AppHeaderProps extends ViewProps {
  title: string | ReactElement;
  accessoryRight?: ReactElement;
  accessoryLeft?: ReactElement;
  onGoBack?: () => void;
  titleClassName?: string;
}

export function AppHeader({
  title,
  accessoryLeft,
  accessoryRight,
  className,
  onGoBack,
  titleClassName,
  ...restProps
}: AppHeaderProps): ReactElement {
  const renderDefaultBackButton = (): ReactElement =>
    onGoBack ? <IconButton
      iconName='strokeLeft'
      className='p-0'
      onPress={onGoBack} /> : <View />;

  return (
    <View
      className={cn(
        'flex-row items-center justify-between mt-safe android:mt-safe-offset-8 pb-8 bg-background-primary px-content-offset',
        className,
      )}
      {...restProps}>
      <View className='min-w-64 items-start justify-center'>
        {accessoryLeft ? accessoryLeft : renderDefaultBackButton()}
      </View>
      {typeof title === 'string' ? (
        <AppText className={cn('font-medium', titleClassName)} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        title
      )}
      <View className='min-w-64 items-end justify-center'>{accessoryRight}</View>
    </View>
  );
}
