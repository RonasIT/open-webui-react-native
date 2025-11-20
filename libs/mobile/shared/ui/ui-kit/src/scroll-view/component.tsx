import { remapProps } from 'nativewind';
import { ReactElement } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

export interface AppScrollViewProps extends ScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

export function AppScrollView({ style, contentContainerStyle, ...props }: AppScrollViewProps): ReactElement {
  return <ScrollView
    style={style}
    contentContainerStyle={contentContainerStyle}
    {...props} />;
}

remapProps(AppScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
