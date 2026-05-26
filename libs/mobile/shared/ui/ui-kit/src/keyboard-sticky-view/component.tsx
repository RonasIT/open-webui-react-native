import { AppSafeAreaView } from '@ronas-it/react-native-common-modules/safe-area-view';
import { PropsWithChildren, ReactElement } from 'react';
import { KeyboardStickyView, KeyboardStickyViewProps } from 'react-native-keyboard-controller';
import { Edge } from 'react-native-safe-area-context';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

type AppKeyboardStickyViewProps = PropsWithChildren<
  KeyboardStickyViewProps & {
    className?: string;
    safeAreaEdges?: Array<Edge>;
  }
>;

export function AppKeyboardStickyView({
  className,
  offset = { opened: 20, closed: 0 },
  style,
  children,
  safeAreaEdges = ['bottom'],
  ...restProps
}: AppKeyboardStickyViewProps): ReactElement {
  return (
    <KeyboardStickyView
      offset={offset}
      className={cn('absolute bottom-0 left-0 right-0 w-full', className)}
      {...restProps}>
      <AppSafeAreaView edges={safeAreaEdges}>{children}</AppSafeAreaView>
    </KeyboardStickyView>
  );
}
