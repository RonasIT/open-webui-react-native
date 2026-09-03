import { ReactElement, Fragment } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppText,
  Avatar,
  Icon,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface AccessRowProps {
  name: string;
  isGroup?: boolean;
  permissionLabel?: string;
  hasCheckbox?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onPermissionPress?: () => void;
  onRemove?: () => void;
}

export function AccessRow({
  name,
  isGroup,
  permissionLabel,
  hasCheckbox,
  isSelected,
  onPress,
  onPermissionPress,
  onRemove,
}: AccessRowProps): ReactElement {
  const className = 'flex-row items-center gap-8 py-12';

  const content = (
    <Fragment>
      {isGroup ? (
        <Icon name='users' />
      ) : (
        <Avatar
          name={name}
          className='bg-brand-primary-transparent'
          textClassName='text-brand-primary' />
      )}
      <AppText className='flex-1' numberOfLines={1}>
        {name}
      </AppText>
      {Boolean(permissionLabel) && (
        <AppPressable
          onPress={onPermissionPress}
          disabled={!onPermissionPress}
          className='bg-background-secondary rounded-6xl px-8 py-[2px]'>
          <AppText className='text-sm-sm sm:text-sm'>{permissionLabel}</AppText>
        </AppPressable>
      )}
      {Boolean(onRemove) && <IconButton
        className='p-0'
        iconName='closeSM'
        onPress={onRemove} />}
      {hasCheckbox && (
        <View
          className={cn(
            'h-24 w-24 items-center justify-center rounded-full',
            isSelected ? 'bg-text-primary' : 'bg-background-secondary border border-text-secondary',
          )}>
          {isSelected && <Icon name='checked' className='color-background-primary h-16 w-16' />}
        </View>
      )}
    </Fragment>
  );

  if (onPress) {
    return (
      <AppPressable onPress={onPress} className={className}>
        {content}
      </AppPressable>
    );
  }

  return <View className={className}>{content}</View>;
}
