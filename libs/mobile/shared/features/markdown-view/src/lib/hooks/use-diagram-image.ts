import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef, useState } from 'react';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { diagramRendererService } from '../services';

const diagramImagesDirectory = `${FileSystem.cacheDirectory}diagrams/`;

/**
 * Prepares a PNG of a rendered diagram for the fullscreen image viewer. The PNG is generated only on demand
 * and cached as a file keyed by the diagram hash, so reopening the same diagram reuses it.
 */
export const useDiagramImage = (diagramKey: string, background: string): typeof result => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  // NOTE: A ref, not state: two taps within one render would both see a stale `isPreparing === false`.
  const isPreparingRef = useRef(false);

  const openImage = async (): Promise<void> => {
    if (isPreparingRef.current) {
      return;
    }

    try {
      isPreparingRef.current = true;
      setIsPreparing(true);
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${diagramKey}:${background}`);
      const uri = `${diagramImagesDirectory}${hash}.png`;
      const { exists } = await FileSystem.getInfoAsync(uri);

      if (!exists) {
        const png = await diagramRendererService.rasterize(diagramKey, background);

        await FileSystem.makeDirectoryAsync(diagramImagesDirectory, { intermediates: true });
        // NOTE: Written to a temporary file first, so an interrupted write never leaves a truncated cached PNG.
        await FileSystem.writeAsStringAsync(`${uri}.tmp`, png, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.moveAsync({ from: `${uri}.tmp`, to: uri });
      }

      setImageUri(uri);
    } catch {
      ToastService.showError();
    } finally {
      isPreparingRef.current = false;
      setIsPreparing(false);
    }
  };

  const closeImage = (): void => setImageUri(null);

  const result = {
    imageUri,
    isPreparing,
    openImage,
    closeImage,
  };

  return result;
};
