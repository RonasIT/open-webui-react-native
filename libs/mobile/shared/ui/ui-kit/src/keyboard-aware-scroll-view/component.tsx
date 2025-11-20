import {
  SCROLLABLE_TYPE,
  createBottomSheetScrollableComponent,
  type BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
import { PropsWithChildren, ReactElement } from 'react';
import { KeyboardAwareScrollViewProps, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Reanimated from 'react-native-reanimated';
import type { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types';

const CustomizedKeyboardAwareScrollView = cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

interface AppKeyboardAwareScrollViewProps extends KeyboardAwareScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

export function AppKeyboardAwareScrollView(props: AppKeyboardAwareScrollViewProps): ReactElement {
  return <CustomizedKeyboardAwareScrollView showsVerticalScrollIndicator={false} {...props} />;
}

//NOTE: Bottom Sheet customizations, docs - https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view#gorhombottom-sheet
const AnimatedScrollView = Reanimated.createAnimatedComponent<KeyboardAwareScrollViewProps>(KeyboardAwareScrollView);
const BottomSheetScrollViewComponent = createBottomSheetScrollableComponent<
  BottomSheetScrollViewMethods,
  BottomSheetScrollViewProps
>(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedScrollView);
const CustomizedBottomSheetKeyboardAwareScrollView = cssInterop(BottomSheetScrollViewComponent, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export function AppBottomSheetKeyboardAwareScrollView({
  children,
  ...restProps
}: PropsWithChildren<AppKeyboardAwareScrollViewProps>): ReactElement {
  return (
    <CustomizedBottomSheetKeyboardAwareScrollView showsVerticalScrollIndicator={false} {...restProps}>
      {children}
    </CustomizedBottomSheetKeyboardAwareScrollView>
  );
}
