import { cssInterop } from 'nativewind';
import { ReactElement } from 'react';
import { KeyboardChatScrollView, KeyboardChatScrollViewProps } from 'react-native-keyboard-controller';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

const CustomizedKeyboardChatScrollView = cssInterop(KeyboardChatScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

type AppKeyboardChatScrollViewProps = KeyboardChatScrollViewProps & {
  className?: string;
  contentContainerClassName?: string;
};

export function AppKeyboardChatScrollView({
  className,
  contentContainerClassName,
  offset = 20,
  automaticallyAdjustContentInsets = false,
  contentInsetAdjustmentBehavior = 'never',
  ...restProps
}: AppKeyboardChatScrollViewProps): ReactElement {
  return (
    <CustomizedKeyboardChatScrollView
      offset={offset}
      automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      className={cn(className)}
      contentContainerClassName={cn(contentContainerClassName)}
      {...restProps}
    />
  );
}
