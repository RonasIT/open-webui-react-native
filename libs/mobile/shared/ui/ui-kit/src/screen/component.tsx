import { ReactElement, useMemo } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { AppScrollView, AppScrollViewProps } from '../scroll-view';
import { View, ViewProps } from '../view';

export interface AppScreenProps {
  scrollDisabled?: boolean;
  noOutsideSpacing?: boolean;
  className?: string;
  header?: ReactElement;
}

interface NonScrollableScreenProps extends ViewProps {
  scrollDisabled: true;
}

interface ScrollableScreenProps extends AppScrollViewProps {
  scrollDisabled?: false;
}

export function AppScreen(props: AppScreenProps & (ScrollableScreenProps | NonScrollableScreenProps)): ReactElement {
  const {
    children,
    testID,
    scrollDisabled,
    noOutsideSpacing,
    className: elementClassName = '',
    header,
    ...restProps
  } = props;

  const [ViewComponent, viewComponentProps] = useMemo(
    (): [typeof View, ViewProps] | [typeof AppScrollView, AppScrollViewProps] =>
      scrollDisabled
        ? [View, { className: cn('flex-1', !noOutsideSpacing && 'px-content-offset', elementClassName), ...restProps }]
        : [
            AppScrollView,
            {
              contentContainerClassName: cn('min-h-full', !noOutsideSpacing && 'px-content-offset', elementClassName),
              showsVerticalScrollIndicator: false,
              keyboardShouldPersistTaps: 'handled',
              ...restProps,
            },
          ],
    [scrollDisabled, noOutsideSpacing, elementClassName, restProps],
  );

  return (
    <View className='flex-1 bg-background-primary' testID={testID}>
      {header}
      <ViewComponent {...viewComponentProps}>{children}</ViewComponent>
    </View>
  );
}
