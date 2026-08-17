import { PropsWithChildren } from 'react';
import { MarkdownProps } from 'react-native-markdown-display';

export interface AppMarkdownViewProps extends PropsWithChildren<MarkdownProps> {
  codeBlockWidth?: number;
  onCitationPress?: (index: string) => void;
  isContentReady?: boolean;
  textColor?: string;
}
