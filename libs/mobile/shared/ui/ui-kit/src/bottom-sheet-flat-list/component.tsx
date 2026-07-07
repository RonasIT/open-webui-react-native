import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppFlashList, AppFlashListProps } from '../flash-list';

export function AppBottomSheetFlashList<TItem>({
  contentContainerClassName,
  ...restProps
}: AppFlashListProps<TItem>): ReactElement {
  return <AppFlashList {...restProps} contentContainerClassName={cn('pb-safe', contentContainerClassName)} />;
}
