import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { MarkdownProps } from 'react-native-markdown-display';
import {
  CodeBlock as NitroCodeBlock,
  Markdown as NitroMarkdown,
  MarkdownRenderers,
  CodeBlockRendererProps,
  CustomRendererProps,
  TableRenderer,
} from 'react-native-nitro-markdown';
import {
  AppText,
  HorizontalOverflowScroll,
  TouchableHighlight,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { normalizeMathDelimiters } from './utils';

interface AppMarkdownViewProps extends PropsWithChildren<MarkdownProps> {
  codeBlockWidth?: number;
  onCitationPress?: (index: string) => void;
  isContentReady?: boolean;
  textColor?: string;
}

export function AppMarkdownView({ children, codeBlockWidth }: AppMarkdownViewProps): ReactElement {
  const translate = useTranslation('SHARED.CODE_BLOCK');

  const nitroSource = useMemo(() => normalizeMathDelimiters(String(children ?? '')), [children]);

  const handleCopy = async (content: string): Promise<void> => {
    await Clipboard.setStringAsync(content);
    ToastService.showSuccess(translate('TEXT_COPIED_TO_CLIPBOARD'));
  };

  const renderers: MarkdownRenderers = {
    table({ node, Renderer }: CustomRendererProps) {
      return (
        <HorizontalOverflowScroll className='my-2'>
          <TableRenderer node={node} Renderer={Renderer} />
        </HorizontalOverflowScroll>
      );
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    code_block({ content, language }: CodeBlockRendererProps) {
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
              language={language}
              style={{
                padding: 0,
                marginVertical: 0,
                backgroundColor: 'transparent',
                borderWidth: 0,
              }}
            />
          </HorizontalOverflowScroll>
        </View>
      );
    },
  };

  return (
    <NitroMarkdown
      options={{ gfm: true, math: true, html: true }}
      highlightCode={true}
      tableOptions={{ minColumnWidth: 80 }}
      renderers={renderers}>
      {nitroSource}
    </NitroMarkdown>
  );
}
