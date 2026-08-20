import { ReactElement, useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { Markdown, darkMarkdownTheme, type MarkdownRenderers } from 'react-native-nitro-markdown';
import { CitationPrefix } from '@open-webui-react-native/mobile/chat/features/use-citations';
import { CodeBlock } from '@open-webui-react-native/mobile/shared/ui/code-block';
import { colors, rem, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { MathSvg, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AppMarkdownViewProps } from '../../types/app-markdown-view-props';
import { MathBlock } from '../math-block';
import { NitroMarkdownTableRenderer } from '../nitro-markdown-table-renderer';

export function NitroMarkdownView({
  codeBlockWidth,
  onCitationPress,
  isContentReady,
  textColor: elementTextColor,
  children,
}: AppMarkdownViewProps): ReactElement {
  const { isDarkColorScheme } = useColorScheme();
  const textColor = elementTextColor || (isDarkColorScheme ? colors.darkTextPrimary : colors.textPrimary);

  const handleLinkPress = useCallback(
    (href: string): boolean => {
      if (href.startsWith(CitationPrefix.CITATION)) {
        const id = href.split(CitationPrefix.CITATION)[1];
        onCitationPress?.(id);

        return false;
      }

      Linking.openURL(href);

      return false;
    },
    [onCitationPress],
  );

  const renderers: MarkdownRenderers = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code_block({ content, language }) {
        return (
          <CodeBlock
            key={`code-block-${language ?? 'text'}-${content.length}`}
            sourceInfo={language}
            content={content}
            textStyle={{ fontSize: rem, lineHeight: 1.29 * rem }}
            fenceStyle={{}}
            codeBlockWidth={codeBlockWidth}
          />
        );
      },
      table({ node, Renderer }) {
        return <NitroMarkdownTableRenderer node={node} Renderer={Renderer} />;
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      math_inline({ content }) {
        if (!content) return null;

        return (
          <View className='justify-center self-start rounded-sm bg-background-tertiary p-4 py-5 mt-4'>
            <MathSvg fontSize={rem}>{content}</MathSvg>
          </View>
        );
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      math_block({ content }) {
        if (!content) return null;

        return <MathBlock
          content={content}
          fontSize={rem}
          isContentReady={isContentReady} />;
      },
    }),
    [codeBlockWidth, isContentReady],
  );

  const theme = useMemo(
    () =>
      isDarkColorScheme
        ? { ...darkMarkdownTheme, colors: { ...darkMarkdownTheme.colors, text: textColor } }
        : { colors: { text: textColor } },
    [isDarkColorScheme, textColor],
  );

  return (
    <Markdown
      options={{ gfm: true, math: true }}
      theme={theme}
      renderers={renderers}
      onLinkPress={handleLinkPress}>
      {typeof children === 'string' ? children : String(children ?? '')}
    </Markdown>
  );
}
