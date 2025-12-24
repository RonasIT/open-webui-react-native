import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View, ViewProps } from '../view';

export function AppDivider({ className, ...rest }: ViewProps): ReactElement {
  return <View className={cn('h-[2px] w-full bg-background-secondary', className)} {...rest} />;
}
