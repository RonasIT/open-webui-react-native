import * as FileSystem from 'expo-file-system/legacy';
import { useRef, useState } from 'react';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { diagramRendererService } from '../services';
import { RenderedDiagram } from '../types';

/**
 * Prepares a PNG of a rendered diagram for the fullscreen image viewer. The PNG is drawn from the SVG at the
 * diagram's own size (not the on-screen one), so it stays sharp when zoomed. It is a temporary file, deleted on close.
 */
export const useDiagramImage = (diagram: RenderedDiagram | undefined, background: string): typeof result => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  // NOTE: A ref, not state: two taps within one render would both see a stale `isPreparing === false`.
  const isPreparingRef = useRef(false);

  const openImage = async (): Promise<void> => {
    if (!diagram || isPreparingRef.current) {
      return;
    }

    try {
      isPreparingRef.current = true;
      setIsPreparing(true);
      const png = await diagramRendererService.rasterize(diagram, background);
      const uri = `${FileSystem.cacheDirectory}diagram-${Date.now()}.png`;

      await FileSystem.writeAsStringAsync(uri, png, { encoding: FileSystem.EncodingType.Base64 });
      setImageUri(uri);
    } catch {
      ToastService.showError();
    } finally {
      isPreparingRef.current = false;
      setIsPreparing(false);
    }
  };

  const closeImage = (): void => {
    if (imageUri) {
      FileSystem.deleteAsync(imageUri, { idempotent: true });
    }
    setImageUri(null);
  };

  const result = {
    imageUri,
    isPreparing,
    openImage,
    closeImage,
  };

  return result;
};
