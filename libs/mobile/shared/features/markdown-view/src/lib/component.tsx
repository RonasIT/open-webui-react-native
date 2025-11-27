import markdownIt from 'markdown-it';
// @ts-expect-error - Type definitions are available, but module resolution doesn't find them
import markdownItMath from 'markdown-it-math/no-default-renderer';
import { colorScheme } from 'nativewind';
import React, { PropsWithChildren, ReactElement, ReactNode, useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import Markdown, { ASTNode, MarkdownProps, RenderRules } from 'react-native-markdown-display';
import { CitationPrefix } from '@open-webui-react-native/mobile/chat/features/use-citations';
import { CodeBlock } from '@open-webui-react-native/mobile/shared/ui/code-block';
import { colors, createStyles, useColorScheme, rem } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, MathSvg, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { MarkdownTableRenderer } from './components/markdown-table-renderer';
import { MathBlock } from './components/math-block';
import { TextGroup } from './components/text-group';
import { MarkdownStyles } from './types';

const markdownItInstance = markdownIt().use(markdownItMath, {
  inlineDelimiters: [
    ['\\pu{', '}'],
    ['\\ce{', '}'],
    ['\\(', '\\)'],
  ],
  blockDelimiters: [
    ['$$', '$$'],
    ['\\[', '\\]'],
    ['\\begin{equation}', '\\end{equation}'],
  ],
  inlineAllowWhiteSpacePadding: true,
});

interface AppMarkdownViewProps extends PropsWithChildren<MarkdownProps> {
  codeBlockWidth?: number;
  onCitationPress?: (index: string) => void;
  isContentReady?: boolean;
  textColor?: string;
}

export function AppMarkdownView({
  codeBlockWidth,
  onCitationPress,
  isContentReady,
  textColor: elementTextColor,
  ...restProps
}: AppMarkdownViewProps): ReactElement {
  const { isDarkColorScheme } = useColorScheme();
  const textColor = elementTextColor || (isDarkColorScheme ? colors.darkTextPrimary : colors.textPrimary);
  const fence: RenderRules['fence'] = useCallback(
    (
      node: ASTNode & { sourceInfo?: string },
      children: any,
      parent: any,
      styles: MarkdownStyles,
      inheritedStyles = {},
    ) => {
      return (
        <CodeBlock
          fenceStyle={[inheritedStyles, styles.fence]}
          key={`code-block-${node.key}`}
          sourceInfo={node.sourceInfo}
          content={node.content}
          textStyle={styles.text}
          codeBlockWidth={codeBlockWidth}
        />
      );
    },
    [codeBlockWidth],
  );

  const renderTable: RenderRules['table'] = useCallback(
    (node: ASTNode & { key: string | number }, children: ReactNode) => {
      return <MarkdownTableRenderer
        key={`table-${node.key}`}
        node={node}
        childrenNodes={children} />;
    },
    [],
  );

  const markdownRules: MarkdownProps['rules'] = useMemo(() => {
    const textProps = { selectable: false };

    return {
      fence,
      text: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles, inheritedStyles = {}) => {
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
        const parts = node.content.split(urlRegex).filter(Boolean);

        return (
          <AppText
            key={`text-${node.key}`}
            style={[styles.text, inheritedStyles]}
            {...textProps}>
            {parts.map((part, index) => {
              const isUrl = urlRegex.test(part);

              if (isUrl) {
                const normalized = part.startsWith('http') ? part : `https://${part}`;

                return (
                  <AppText
                    key={index}
                    style={[styles.link]}
                    onPress={() => Linking.openURL(normalized)}>
                    {`\u00A0${part}\u00A0`}
                  </AppText>
                );
              }

              return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
          </AppText>
        );
      },
      strong: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles, inheritedStyles = {}) => (
        <AppText
          key={`strong-${node.key}`}
          style={[styles.strong, inheritedStyles]}
          {...textProps}>
          {children}
        </AppText>
      ),
      em: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles, inheritedStyles = {}) => (
        <AppText
          key={`em-${node.key}`}
          style={[styles.em, inheritedStyles]}
          {...textProps}>
          {children}
        </AppText>
      ),
      paragraph: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles) => (
        <AppText
          key={`paragraph-${node.key}`}
          style={[styles.paragraph]}
          {...textProps}>
          {children}
        </AppText>
      ),
      textgroup: (node: ASTNode, children: Array<ReactNode>, parent: any, styles: MarkdownStyles) => (
        <TextGroup
          node={node}
          key={`textgroup-${node.key}`}
          styles={styles}
          textProps={textProps}>
          {children}
        </TextGroup>
      ),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code_inline: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles, inheritedStyles = {}) => (
        <AppText
          key={`code_inline-${node.key}`}
          style={[styles.code_inline, inheritedStyles, markdownStyles.code_inline_color]}
          {...textProps}>
          {`\u00A0${node.content}\u00A0`}
        </AppText>
      ),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      math_inline: (node: ASTNode) => {
        return (
          <View
            key={`math-inline-${node.key}-${node.content.length}`}
            className='justify-center py-5 bg-background-tertiary self-start p-4 rounded-sm mt-4'>
            <MathSvg fontSize={14}>{node.content}</MathSvg>
          </View>
        );
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      math_block: (node: ASTNode) => {
        return <MathBlock
          isContentReady={isContentReady}
          content={node.content}
          key={`math-block-${node.key}`} />;
      },
      link: (node: ASTNode, children: any, parent: any, styles: MarkdownStyles) => {
        const href = node.attributes?.href ?? '';
        const isCitation = href.startsWith(CitationPrefix.CITATION);
        const onOpenLink = async (): Promise<void> => (await Linking.canOpenURL(href)) && Linking.openURL(href);

        if (isCitation) {
          const id = href.split(CitationPrefix.CITATION)[1];
          const content = node.children[0]?.content ?? '';

          return (
            <AppText
              key={`link-${node.key}`}
              style={[styles.link, markdownStyles.citation_link]}
              onPress={() => onCitationPress?.(id)}>
              {`\u00A0${content}\u00A0`}
            </AppText>
          );
        }

        return (
          <AppText
            key={`link-${node.key}`}
            style={[styles.link]}
            onPress={onOpenLink}
            {...textProps}>
            {children}
          </AppText>
        );
      },
      softbreak: (node) => (
        <AppText key={`softbreak-${node.key}`} {...textProps}>
          {' '}
        </AppText>
      ),
      hardbreak: (node) => (
        <AppText key={`hardbreak-${node.key}`} {...textProps}>
          {'\n'}
        </AppText>
      ),
      table: renderTable,
    };
  }, [fence, onCitationPress, isContentReady, renderTable]);

  return (
    <Markdown
      style={{
        ...markdownStyles,
        body: { ...markdownStyles.body, color: textColor },
        code_inline: { backgroundColor: isDarkColorScheme ? colors.gray700 : colors.gray75 },
      }}
      rules={markdownRules}
      {...restProps}
      markdownit={markdownItInstance}
    />
  );
}

const markdownStyles = createStyles({
  heading1: {
    fontSize: 1.9465 * rem,
    lineHeight: 2.26 * rem,
    fontWeight: '600',
  },
  heading2: {
    fontSize: 1.3535 * rem,
    lineHeight: 2.03 * rem,
    fontWeight: '600',
  },
  heading3: {
    fontSize: 1.0965 * rem,
    lineHeight: 1.86 * rem,
  },
  heading4: {
    fontSize: 1 * rem,
    lineHeight: 1.71 * rem,
  },
  heading5: {
    fontSize: 0.8 * rem,
    lineHeight: 1.29 * rem,
  },
  heading6: {
    fontSize: 0.7 * rem,
    lineHeight: 1.07 * rem,
  },
  body: {
    fontSize: rem,
    lineHeight: 1.29 * rem,
  },
  list_item: {
    marginVertical: 0.21 * rem,
  },
  bullet_list_icon: {
    fontSize: 1.3535 * rem,
    lineHeight: 1.3535 * rem,
    fontWeight: '600',
  },
  paragraph: {
    marginTop: 0.5 * rem,
    marginBottom: 0.5 * rem,
  },
  link: {
    fontSize: 0.86 * rem,
    lineHeight: 1.29 * rem,
    color: colors.codeInline,
  },
  hr: {
    backgroundColor: colorScheme.get() === 'dark' ? colors.gray700 : colors.gray200,
    marginTop: 0.5 * rem,
    marginBottom: 0.5 * rem,
  },
  code_inline_color: {
    color: colors.codeInline,
    fontSize: rem * 0.8,
    fontWeight: '600',
  },
  citation_link: {
    color: colorScheme.get() === 'dark' ? colors.textForeground : colors.textPrimary,
    backgroundColor: colorScheme.get() === 'dark' ? colors.gray700 : colors.gray75,
    textDecorationLine: 'none',
  },
});
