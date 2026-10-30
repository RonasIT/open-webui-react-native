import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useQuery } from '@tanstack/react-query';
import { cloneElement, ReactElement, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import { ImagePreviewModal } from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { CodeBlockHeader, CodeBlockProps } from '@open-webui-react-native/mobile/shared/ui/code-block';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, TouchableHighlight, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { DiagramLanguage } from '../../enums';
import { useDiagramImage } from '../../hooks';
import { diagramRendererService, getDiagramQueryKey } from '../../services';

// NOTE: Rendered SVGs stay in memory this long after the last block showing them unmounts.
const diagramCacheTime = 30 * 60 * 1000;

interface DiagramBlockProps {
  language: DiagramLanguage;
  content: string;
  children: ReactElement<CodeBlockProps>;
}

/**
 * Shows a closed Mermaid / Vega / Vega-Lite block as an SVG diagram, a tap opens it fullscreen as an image.
 * The header toggle switches between the diagram and `children` (the regular code block).
 * `children` is also shown while rendering and when rendering fails.
 */
export function DiagramBlock({ language, content, children }: DiagramBlockProps): ReactElement {
  const translate = useTranslation('SHARED.MARKDOWN_VIEW.DIAGRAM_BLOCK');
  const { isDarkColorScheme } = useColorScheme();
  const [isCodeShown, setIsCodeShown] = useState(false);
  const request = { language, code: content, isDarkTheme: isDarkColorScheme };
  const { data: diagram } = useQuery({
    queryKey: getDiagramQueryKey(request),
    queryFn: () => diagramRendererService.render(request),
    staleTime: Infinity,
    gcTime: diagramCacheTime,
    // NOTE: A diagram that failed or hung is not rendered again, the block keeps showing its code.
    retry: false,
    retryOnMount: false,
    meta: { persist: false },
  });
  // NOTE: The PNG gets a solid theme background, a transparent one looks broken on the black image viewer.
  const { imageUri, isPreparing, openImage, closeImage } = useDiagramImage(
    diagram,
    isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary,
  );

  const toggleCode = (): void => setIsCodeShown(!isCodeShown);

  if (!diagram) {
    return children;
  }

  // NOTE: Sits in the same header slot in both modes, so the toggle stays under the finger.
  const toggleButton = (
    <TouchableHighlight
      className='p-4 rounded-lg'
      underlayColorClassName='color-background-tertiary'
      accessibilityRole='button'
      accessibilityLabel={translate(isCodeShown ? 'TEXT_SHOW_DIAGRAM' : 'TEXT_SHOW_CODE')}
      onPress={toggleCode}>
      <AppText className='text-sm-sm sm:text-sm'>{translate(isCodeShown ? 'BUTTON_DIAGRAM' : 'BUTTON_CODE')}</AppText>
    </TouchableHighlight>
  );

  if (isCodeShown) {
    return cloneElement(children, { headerActions: toggleButton });
  }

  return (
    <View className='rounded-lg my-4 p-12 pt-4 bg-background-tertiary'>
      <CodeBlockHeader
        className='mb-8'
        title={language}
        content={content}
        actions={toggleButton} />
      <AppPressable
        onPress={openImage}
        disabled={isPreparing}
        accessibilityRole='button'
        accessibilityLabel={translate('TEXT_OPEN_FULLSCREEN')}
        className='items-center'>
        {/* NOTE: Yoga derives aspectRatio height from the unclamped width, so the width limit sits on a parent. */}
        <View style={{ width: '100%', maxWidth: diagram.width }}>
          <View style={{ width: '100%', aspectRatio: diagram.width / diagram.height }}>
            <SvgXml
              xml={diagram.svg}
              width='100%'
              height='100%'
              fallback={children} />
          </View>
        </View>
      </AppPressable>
      {imageUri && (
        <ImagePreviewModal
          visible
          initialIndex={0}
          images={[{ type: FileType.IMAGE, url: imageUri, index: 0 }]}
          onClosePress={closeImage}
        />
      )}
    </View>
  );
}
