import { FlashList, FlashListProps } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';
import React, { ReactElement, Ref } from 'react';

type FlashListInstance<T> = React.ComponentRef<typeof FlashList<T>>;

const CustomizedFlashList = cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
}) as <TItem>(
  props: FlashListProps<TItem> & { className?: string; contentContainerClassName?: string },
) => ReactElement;

export interface AppFlashListProps<TItem> extends FlashListProps<TItem> {
  className?: string;
  contentContainerClassName?: string;
  ref?: Ref<FlashListInstance<TItem>>;
}

export function AppFlashList<TItem>(props: AppFlashListProps<TItem>): ReactElement {
  return <CustomizedFlashList {...props} />;
}
