import { ReactElement, useEffect, useSyncExternalStore } from 'react';
import { SvgXml } from 'react-native-svg';
import { ImagePreviewModal } from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { DiagramLanguage } from '../../enums';
import { useDiagramImage } from '../../hooks';
import { diagramRendererService } from '../../services';

interface DiagramBlockProps {
  language: DiagramLanguage;
  content: string;
  children: ReactElement;
}

/**
 * Shows a closed Mermaid / Vega / Vega-Lite block as an SVG diagram, a tap opens it fullscreen as an image.
 * `children` (the regular code block) is shown while rendering and when rendering fails.
 */
export function DiagramBlock({ language, content, children }: DiagramBlockProps): ReactElement {
  const { isDarkColorScheme } = useColorScheme();
  const key = diagramRendererService.getKey(language, content, isDarkColorScheme);
  const result = useSyncExternalStore(diagramRendererService.subscribe, () => diagramRendererService.getResult(key));
  // NOTE: The PNG gets a solid theme background, a transparent one looks broken on the black image viewer.
  const { imageUri, isPreparing, openImage, closeImage } = useDiagramImage(
    key,
    isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary,
  );

  useEffect(() => {
    diagramRendererService.requestRender(language, content, isDarkColorScheme);
  }, [language, content, isDarkColorScheme]);

  if (!result || 'error' in result) {
    return children;
  }

  return (
    <AppPressable
      onPress={openImage}
      disabled={isPreparing}
      className='rounded-lg my-4 p-12 bg-background-tertiary items-center'>
      <View style={{ width: '100%', maxWidth: result.width, aspectRatio: result.width / result.height }}>
        <SvgXml
          xml={result.svg}
          width='100%'
          height='100%'
          fallback={children} />
      </View>
      {imageUri && (
        <ImagePreviewModal
          visible
          initialIndex={0}
          images={[{ type: FileType.IMAGE, url: imageUri, index: 0 }]}
          onClosePress={closeImage}
        />
      )}
    </AppPressable>
  );
}
