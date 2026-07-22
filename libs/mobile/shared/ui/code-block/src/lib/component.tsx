import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { ReactElement, useCallback, useMemo } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { github, stackoverflowDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  View,
  AppText,
  TouchableHighlight,
  HorizontalOverflowScroll,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface CodeBlockProps {
  sourceInfo?: string;
  content: string;
  textStyle: StyleProp<TextStyle>;
  fenceStyle: StyleProp<TextStyle>;
  codeBlockWidth?: number;
  minCodeBlockWidth?: number;
  scrollViewStyle?: StyleProp<ViewStyle>;
}

export function CodeBlock({
  content,
  sourceInfo,
  textStyle,
  codeBlockWidth,
  scrollViewStyle,
  fenceStyle,
}: CodeBlockProps): ReactElement {
  const translate = useTranslation('SHARED.CODE_BLOCK');
  const { isDarkColorScheme } = useColorScheme();

  const handleCopy = useCallback(async (): Promise<void> => {
    await Clipboard.setStringAsync(content);
    ToastService.showSuccess(translate('TEXT_COPIED_TO_CLIPBOARD'));
  }, [content, translate]);

  const copyButton = useMemo(
    () => (
      <TouchableHighlight
        className='p-4 rounded-lg ml-auto'
        underlayColorClassName='color-background-tertiary'
        onPress={handleCopy}>
        <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_COPY')}</AppText>
      </TouchableHighlight>
    ),
    [handleCopy, translate],
  );

  if (!sourceInfo || sourceInfo === 'markdown') {
    const formattedContent = content.endsWith('\n') ? content.slice(0, -1) : content;

    return (
      <View className='gap-4'>
        {copyButton}
        <AppText style={fenceStyle} className={'bg-background-tertiary rounded-lg p-12'}>
          {formattedContent}
        </AppText>
      </View>
    );
  }

  //NOTE styles from createStyles does not work
  return (
    <View
      className='rounded-lg my-4 p-12 pt-4 bg-background-tertiary'
      style={codeBlockWidth ? { maxWidth: codeBlockWidth } : undefined}>
      <View className='flex-row items-center mb-8'>
        <AppText className='text-sm-sm sm:text-sm'>{sourceInfo}</AppText>
        {copyButton}
      </View>
      <HorizontalOverflowScroll showsHorizontalScrollIndicator={false}>
        <CodeHighlighter
          customStyle={{ backgroundColor: 'transparent' }}
          hljsStyle={isDarkColorScheme ? stackoverflowDark : github}
          scrollViewProps={{
            scrollEnabled: false,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: [
              {
                borderRadius: 10,
                backgroundColor: 'transparent',
              },
              scrollViewStyle,
            ],
            style: {
              backgroundColor: 'transparent',
            },
          }}
          textStyle={textStyle}>
          {content}
        </CodeHighlighter>
      </HorizontalOverflowScroll>
    </View>
  );
}
