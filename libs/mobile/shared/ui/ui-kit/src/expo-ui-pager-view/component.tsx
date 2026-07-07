import PagerView, {
  type PageScrollStateChangedEvent,
  type PageScrollStateChangedEventData,
  type PagerViewOnPageScrollEvent,
  type PagerViewOnPageScrollEventData,
  type PagerViewOnPageSelectedEvent,
  type PagerViewOnPageSelectedEventData,
  type PagerViewProps,
  type PagerViewRef,
} from '@expo/ui/community/pager-view';
import { ReactElement } from 'react';

export type ExpoUiPagerViewProps = PagerViewProps;
export type ExpoUiPagerViewRef = PagerViewRef;
export type ExpoUiPagerViewOnPageScrollEvent = PagerViewOnPageScrollEvent;
export type ExpoUiPagerViewOnPageScrollEventData = PagerViewOnPageScrollEventData;
export type ExpoUiPagerViewOnPageSelectedEvent = PagerViewOnPageSelectedEvent;
export type ExpoUiPagerViewOnPageSelectedEventData = PagerViewOnPageSelectedEventData;
export type ExpoUiPagerViewPageScrollStateChangedEvent = PageScrollStateChangedEvent;
export type ExpoUiPagerViewPageScrollStateChangedEventData = PageScrollStateChangedEventData;

export function ExpoUiPagerView(props: ExpoUiPagerViewProps): ReactElement {
  return <PagerView {...props} />;
}
