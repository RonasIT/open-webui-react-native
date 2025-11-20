import { StyleProp, TextStyle, ViewStyle, TextProps } from 'react-native';

export interface MarkdownTextProps
  extends Pick<
    TextProps,
    | 'selectable'
    | 'allowFontScaling'
    | 'maxFontSizeMultiplier'
    | 'minimumFontScale'
    | 'numberOfLines'
    | 'ellipsizeMode'
    | 'lineBreakMode'
    | 'adjustsFontSizeToFit'
    | 'testID'
    | 'accessible'
    | 'accessibilityLabel'
    | 'accessibilityHint'
    | 'accessibilityRole'
    | 'onPress'
    | 'onLongPress'
  > {
  [key: string]: any;
}

export interface MarkdownStyles {
  // Core text styles
  text: StyleProp<TextStyle>;
  strong: StyleProp<TextStyle>;
  em: StyleProp<TextStyle>;
  paragraph: StyleProp<TextStyle>;
  textgroup: StyleProp<TextStyle>;

  // Heading styles
  heading1?: StyleProp<TextStyle>;
  heading2?: StyleProp<TextStyle>;
  heading3?: StyleProp<TextStyle>;
  heading4?: StyleProp<TextStyle>;
  heading5?: StyleProp<TextStyle>;
  heading6?: StyleProp<TextStyle>;

  // Body and layout styles
  body?: StyleProp<TextStyle>;
  blockquote?: StyleProp<ViewStyle>;
  hr?: StyleProp<ViewStyle>;

  // List styles
  listItem?: StyleProp<ViewStyle>;

  // Table styles
  table?: StyleProp<ViewStyle>;
  thead?: StyleProp<ViewStyle>;
  tbody?: StyleProp<ViewStyle>;
  th?: StyleProp<TextStyle>;
  tr?: StyleProp<ViewStyle>;
  td?: StyleProp<TextStyle>;

  // Link and image styles
  link?: StyleProp<TextStyle>;
  blocklink?: StyleProp<ViewStyle>;
  image?: StyleProp<ViewStyle>;

  // Code styles
  codeInline?: StyleProp<TextStyle>;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  code_inline?: StyleProp<TextStyle>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  list_item?: StyleProp<ViewStyle>;

  // Allow additional dynamic properties
  [key: string]: StyleProp<TextStyle | ViewStyle> | undefined;
}
