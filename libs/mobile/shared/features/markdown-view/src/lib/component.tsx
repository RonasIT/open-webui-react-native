import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as ExpoClipboard from 'expo-clipboard';
import { memo, PropsWithChildren, ReactElement, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { MarkdownProps } from 'react-native-markdown-display';
import {
  CodeBlock as NitroCodeBlock,
  Markdown as NitroMarkdown,
  MarkdownRenderers,
  CodeBlockRendererProps,
  CustomRendererProps,
  TableRenderer,
  MarkdownStream,
  useMarkdownSession,
  TableOptions,
  ParserOptions,
} from 'react-native-nitro-markdown';
import {
  AppText,
  HorizontalOverflowScroll,
  TouchableHighlight,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { normalizeMathDelimiters } from './utils';

const NITRO_PARSER_OPTIONS_BASE: Omit<ParserOptions, 'math'> = {
  gfm: true,
  html: true,
};

const TABLE_OPTIONS_STATIC: TableOptions = {
  minColumnWidth: 80,
};

const TABLE_OPTIONS_STREAMING: TableOptions = {
  minColumnWidth: 80,
  // Debounce column measurement longer while the table is still growing.
  measurementStabilizeMs: 300,
};

const CODE_BLOCK_STYLE = {
  padding: 0,
  marginVertical: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
} as const;

/** Skip token Text trees for very large fences even when highlighting is enabled. */
const HIGHLIGHT_MAX_CODE_LENGTH = 4000;

const MATH_HINT_PATTERN = /\$\$|\\\(|\\\[|\\begin\{equation\}|\\ce\{|\\pu\{/;

interface AppMarkdownViewProps extends PropsWithChildren<MarkdownProps> {
  codeBlockWidth?: number;
  onCitationPress?: (index: string) => void;
  isContentReady?: boolean;
  textColor?: string;
  /** When true, feeds a MarkdownSession for incremental AST reuse while content grows. */
  isStreaming?: boolean;
}

interface MarkdownBodyProps {
  source: string;
  codeBlockWidth?: number;
  highlightCode: boolean;
  isStreaming: boolean;
}

function hasMathSyntax(markdown: string): boolean {
  return MATH_HINT_PATTERN.test(markdown);
}

function useMarkdownRenderConfig({ source, codeBlockWidth, highlightCode, isStreaming }: MarkdownBodyProps): {
  parserOptions: ParserOptions;
  tableOptions: TableOptions;
  renderers: MarkdownRenderers;
} {
  const translate = useTranslation('SHARED.CODE_BLOCK');
  const enableMath = useMemo(() => hasMathSyntax(source), [source]);

  const parserOptions = useMemo<ParserOptions>(
    () => ({
      ...NITRO_PARSER_OPTIONS_BASE,
      math: enableMath,
    }),
    [enableMath],
  );

  const tableOptions = isStreaming ? TABLE_OPTIONS_STREAMING : TABLE_OPTIONS_STATIC;

  const handleCopy = useCallback(
    async (content: string): Promise<void> => {
      await ExpoClipboard.setStringAsync(content);
      ToastService.showSuccess(translate('TEXT_COPIED_TO_CLIPBOARD'));
    },
    [translate],
  );

  const renderers: MarkdownRenderers = useMemo(
    () => ({
      table({ node, Renderer }: CustomRendererProps) {
        return (
          <HorizontalOverflowScroll className='my-2'>
            <TableRenderer node={node} Renderer={Renderer} />
          </HorizontalOverflowScroll>
        );
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code_block({ content, language }: CodeBlockRendererProps) {
        const highlightLanguage = highlightCode && content.length <= HIGHLIGHT_MAX_CODE_LENGTH ? language : undefined;

        return (
          <View
            className='rounded-lg my-4 p-12 pt-4 bg-background-tertiary'
            style={codeBlockWidth ? { maxWidth: codeBlockWidth } : undefined}>
            <TouchableHighlight
              className='p-4 rounded-lg ml-auto'
              underlayColorClassName='color-background-tertiary'
              onPress={() => handleCopy(content)}>
              <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_COPY')}</AppText>
            </TouchableHighlight>
            <HorizontalOverflowScroll showsHorizontalScrollIndicator={false}>
              <NitroCodeBlock
                content={content}
                language={highlightLanguage}
                style={CODE_BLOCK_STYLE} />
            </HorizontalOverflowScroll>
          </View>
        );
      },
    }),
    [codeBlockWidth, handleCopy, highlightCode, translate],
  );

  return {
    parserOptions,
    tableOptions,
    renderers,
  };
}

function AppMarkdownStreamingBody({
  source,
  codeBlockWidth,
  highlightCode,
}: Omit<MarkdownBodyProps, 'isStreaming'>): ReactElement {
  const initialSourceRef = useRef(source);
  const sessionController = useMarkdownSession(initialSourceRef.current);
  const previousSourceRef = useRef(initialSourceRef.current);
  const { parserOptions, tableOptions, renderers } = useMarkdownRenderConfig({
    source,
    codeBlockWidth,
    highlightCode,
    isStreaming: true,
  });

  useLayoutEffect(() => {
    const session = sessionController.getSession();
    const previousSource = previousSourceRef.current;

    if (source === previousSource) {
      return;
    }

    if (previousSource.length > 0 && source.startsWith(previousSource)) {
      session.append(source.slice(previousSource.length));
    } else {
      session.reset(source);
    }

    previousSourceRef.current = source;
  }, [sessionController, source]);

  return (
    <MarkdownStream
      session={sessionController}
      updateStrategy='raf'
      incrementalParsing
      options={parserOptions}
      highlightCode={highlightCode}
      tableOptions={tableOptions}
      renderers={renderers}
    />
  );
}

function AppMarkdownStaticBody({
  source,
  codeBlockWidth,
  highlightCode,
}: Omit<MarkdownBodyProps, 'isStreaming'>): ReactElement {
  const { parserOptions, tableOptions, renderers } = useMarkdownRenderConfig({
    source,
    codeBlockWidth,
    highlightCode,
    isStreaming: false,
  });

  return (
    <NitroMarkdown
      options={parserOptions}
      highlightCode={highlightCode}
      tableOptions={tableOptions}
      renderers={renderers}>
      {source}
    </NitroMarkdown>
  );
}

function AppMarkdownViewComponent({
  children,
  codeBlockWidth,
  isContentReady,
  isStreaming = false,
}: AppMarkdownViewProps): ReactElement {
  const nitroSource = useMemo(() => normalizeMathDelimiters(String(children ?? '')), [children]);
  const highlightCode = (isContentReady ?? true) && !isStreaming;

  if (isStreaming) {
    return (
      <AppMarkdownStreamingBody
        source={nitroSource}
        codeBlockWidth={codeBlockWidth}
        highlightCode={highlightCode} />
    );
  }

  return <AppMarkdownStaticBody
    source={nitroSource}
    codeBlockWidth={codeBlockWidth}
    highlightCode={highlightCode} />;
}

export const AppMarkdownView = memo(AppMarkdownViewComponent);
