import { BottomSheetFlashList } from '@gorhom/bottom-sheet';
import { BottomSheetFlashListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList';
import { ReactElement } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

interface AppBottomSheetFlashListProps<TItem> extends BottomSheetFlashListProps<TItem> {
  contentContainerClassName?: string;
}

export function AppBottomSheetFlashList<TItem>({
  contentContainerClassName,
  ...restProps
}: AppBottomSheetFlashListProps<TItem>): ReactElement {
  return <BottomSheetFlashList {...restProps} contentContainerClassName={cn('pb-safe', contentContainerClassName)} />;
}
