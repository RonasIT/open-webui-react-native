import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { ReactElement, useMemo, useState } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { github, stackoverflowDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { screenWidth, spacings, useColorScheme } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { View, AppText, TouchableHighlight } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';

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
  codeBlockWidth: elementCodeBlockWidth = screenWidth - spacings.screenHorizontalOffset - 24, //NOTE 24 is the padding of the code block
  minCodeBlockWidth = 320,
  scrollViewStyle,
  fenceStyle,
}: CodeBlockProps): ReactElement {
  const translate = useTranslation('SHARED.CODE_BLOCK');
  const codeBlockWidth = Math.max(elementCodeBlockWidth, minCodeBlockWidth);
  const [codeContentWidth, setCodeContentWidth] = useState(0);
  const isScrollEnabled = codeContentWidth < codeBlockWidth;
  const { isDarkColorScheme } = useColorScheme();

  const handleCopy = async (): Promise<void> => {
    await Clipboard.setStringAsync(content);
    ToastService.showSuccess(translate('TEXT_COPIED_TO_CLIPBOARD'));
  };

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
        <AppText style={fenceStyle}>{formattedContent}</AppText>
      </View>
    );
  }

  //NOTE styles from createStyles does not work
  return (
    <View className='rounded-lg overflow-hidden my-4 p-12 pt-4 bg-background-tertiary'>
      <View className='flex-row items-center mb-8'>
        <AppText className='text-sm-sm sm:text-sm'>{sourceInfo}</AppText>
        {copyButton}
      </View>
      <CodeHighlighter
        customStyle={{ backgroundColor: 'transparent' }}
        hljsStyle={isDarkColorScheme ? stackoverflowDark : github}
        scrollViewProps={{
          onLayout: (event) => {
            setCodeContentWidth(event.nativeEvent.layout.width);
          },
          contentContainerStyle: [
            {
              width: codeBlockWidth,
              borderRadius: 10,
              backgroundColor: 'transparent',
            },
            scrollViewStyle,
          ],
          scrollEnabled: isScrollEnabled,
          showsHorizontalScrollIndicator: false,
          style: {
            backgroundColor: 'transparent',
          },
        }}
        textStyle={textStyle}>
        {content}
      </CodeHighlighter>
    </View>
  );
}
