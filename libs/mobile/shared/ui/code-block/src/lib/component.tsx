import { ReactElement, ReactNode, useState } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { github, stackoverflowDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { screenWidth, spacings, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View, AppText } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { CodeBlockHeader } from './components';

export interface CodeBlockProps {
  sourceInfo?: string;
  content: string;
  textStyle: StyleProp<TextStyle>;
  fenceStyle: StyleProp<TextStyle>;
  codeBlockWidth?: number;
  minCodeBlockWidth?: number;
  scrollViewStyle?: StyleProp<ViewStyle>;
  headerActions?: ReactNode;
}

export function CodeBlock({
  content,
  sourceInfo,
  textStyle,
  codeBlockWidth: elementCodeBlockWidth = screenWidth - spacings.screenHorizontalOffset - 24, //NOTE 24 is the padding of the code block
  minCodeBlockWidth = 320,
  scrollViewStyle,
  fenceStyle,
  headerActions,
}: CodeBlockProps): ReactElement {
  const codeBlockWidth = Math.max(elementCodeBlockWidth, minCodeBlockWidth);
  const [codeContentWidth, setCodeContentWidth] = useState(0);
  const isScrollEnabled = codeContentWidth < codeBlockWidth;
  const { isDarkColorScheme } = useColorScheme();

  if (!sourceInfo || sourceInfo === 'markdown') {
    const formattedContent = content.endsWith('\n') ? content.slice(0, -1) : content;

    return (
      <View className='gap-4'>
        <CodeBlockHeader content={content} actions={headerActions} />
        <AppText style={fenceStyle} className={'bg-background-tertiary rounded-lg p-12'}>
          {formattedContent}
        </AppText>
      </View>
    );
  }

  //NOTE styles from createStyles does not work
  return (
    <View className='rounded-lg overflow-hidden my-4 p-12 pt-4 bg-background-tertiary'>
      <CodeBlockHeader
        className='mb-8'
        title={sourceInfo}
        content={content}
        actions={headerActions} />
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
