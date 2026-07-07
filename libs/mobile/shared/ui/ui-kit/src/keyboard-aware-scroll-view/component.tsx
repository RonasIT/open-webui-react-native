import { cssInterop } from 'nativewind';
import { PropsWithChildren, ReactElement } from 'react';
import { KeyboardAwareScrollViewProps, KeyboardAwareScrollView } from 'react-native-keyboard-controller';

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

const CustomizedBottomSheetKeyboardAwareScrollView = cssInterop(KeyboardAwareScrollView, {
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
