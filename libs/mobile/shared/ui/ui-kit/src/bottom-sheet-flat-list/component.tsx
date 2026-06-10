import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import { ReactElement } from 'react';
import { ScrollViewProps } from 'react-native';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppFlashList, AppFlashListProps } from '../flash-list';

export function AppBottomSheetFlashList<TItem>({
  contentContainerClassName,
  ...restProps
}: AppFlashListProps<TItem>): ReactElement {
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();

  return (
    <AppFlashList
      {...restProps}
      renderScrollComponent={renderScrollComponent}
      contentContainerClassName={cn('pb-safe', contentContainerClassName)}
    />
  );
}
