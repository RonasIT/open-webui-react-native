import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { cloneElement, ReactElement, useEffect, useState, useSyncExternalStore } from 'react';
import { SvgXml } from 'react-native-svg';
import { ImagePreviewModal } from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { CodeBlockHeader, CodeBlockProps } from '@open-webui-react-native/mobile/shared/ui/code-block';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, TouchableHighlight, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { DiagramLanguage } from '../../enums';
import { useDiagramImage } from '../../hooks';
import { diagramRendererService } from '../../services';

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
  const key = diagramRendererService.getKey(language, content, isDarkColorScheme);
  const result = useSyncExternalStore(diagramRendererService.subscribe, () => diagramRendererService.getResult(key));
  // NOTE: The PNG gets a solid theme background, a transparent one looks broken on the black image viewer.
  const { imageUri, isPreparing, openImage, closeImage } = useDiagramImage(
    key,
    isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary,
  );

  const toggleCode = (): void => setIsCodeShown(!isCodeShown);

  useEffect(() => {
    diagramRendererService.requestRender(language, content, isDarkColorScheme);
  }, [language, content, isDarkColorScheme]);

  if (!result || 'error' in result) {
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
        <View style={{ width: '100%', maxWidth: result.width, aspectRatio: result.width / result.height }}>
          <SvgXml
            xml={result.svg}
            width='100%'
            height='100%'
            fallback={children} />
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
