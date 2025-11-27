import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { IconButton, IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface SelectOptionIconProps {
  onPress: () => void;
  iconName: IconName;
  isSelected?: boolean;
  disabled?: boolean;
}

export function SelectOptionIcon({ onPress, iconName, isSelected, disabled }: SelectOptionIconProps): ReactElement {
  return (
    <IconButton
      iconName={iconName}
      onPress={onPress}
      className='p-0'
      iconProps={{ className: cn(isSelected && 'color-brand-primary') }}
      disabled={disabled}
    />
  );
}
