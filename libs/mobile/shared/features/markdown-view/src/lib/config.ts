import { isSmallScreen } from '@open-webui-react-native/mobile/shared/ui/styles';

export const appMarkdownViewConfig = {
  mathInlineKey: 'math_inline',
  maxCharactersForMathInlineRow: isSmallScreen ? 35 : 40, //NOTE Values are derived from testing on devices of different sizes.
  /** Must match CitationPrefix.CITATION from use-citations (`citation-`). */
  citationHrefPrefix: 'citation-',
};
