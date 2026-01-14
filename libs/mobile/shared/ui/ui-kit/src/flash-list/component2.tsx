// AppLegendList.tsx
import { LegendList, LegendListProps } from '@legendapp/list';
import { cssInterop } from 'nativewind';
import { ReactElement } from 'react';

const StyledLegendList = cssInterop(LegendList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
}) as <TItem>(
  props: LegendListProps<TItem> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => ReactElement;

export type AppLegendListProps<TItem> = LegendListProps<TItem> & {
  className?: string;
  contentContainerClassName?: string;
};

export function AppLegendList<TItem>(props: AppLegendListProps<TItem>): ReactElement {
  return <StyledLegendList {...props} />;
}
