import { ReactElement, useEffect, useState } from 'react';
import { AppScrollView, AppSpinner, MathSvg, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';

interface MathBlockProps {
  content: string;
  isContentReady?: boolean;
}

export function MathBlock({ content, isContentReady }: MathBlockProps): ReactElement {
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const { debouncedQuery: debouncedContent, setQuery } = useDebouncedQuery();
  const renderedContent = isContentReady ? content : debouncedContent;

  useEffect(() => {
    setQuery(content);
  }, [content]);

  return (
    <View
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
      className='bg-background-tertiary mt-4 rounded-sm justify-center items-center min-h-32'>
      <AppScrollView
        scrollEnabled={containerWidth < contentWidth}
        scrollIndicatorInsets={{ bottom: -2 }}
        contentContainerClassName='px-4 py-8'
        horizontal>
        {renderedContent ? (
          <MathSvg
            onLayout={(event) => {
              setContentWidth(event.nativeEvent.layout.width);
            }}
            fontSize={12}>
            {renderedContent}
          </MathSvg>
        ) : (
          <AppSpinner size='small' />
        )}
      </AppScrollView>
    </View>
  );
}
