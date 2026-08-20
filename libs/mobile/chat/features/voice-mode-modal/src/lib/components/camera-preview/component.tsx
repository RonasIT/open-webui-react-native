import { CameraType, CameraView } from 'expo-camera';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ImageData as ChatImageData } from '@open-webui-react-native/shared/data-access/common';

export type CameraPreviewMethods = {
  takePicture: () => Promise<ChatImageData | null>;
};

export type CameraPreviewRef = ForwardedRef<CameraPreviewMethods>;

export interface CameraPreviewProps {
  facing: CameraType;
  onClose: () => void;
  ref?: CameraPreviewRef;
}

const PICTURE_QUALITY = 0.2;

export function CameraPreview({ facing, onClose, ref }: CameraPreviewProps): ReactElement {
  const cameraRef = useRef<CameraView>(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      takePicture: async (): Promise<ChatImageData | null> => {
        if (!isReady || !cameraRef.current) {
          return null;
        }

        try {
          const photo = await cameraRef.current.takePictureAsync({
            base64: true,
            quality: PICTURE_QUALITY,
            shutterSound: false,
          });

          if (!photo?.uri || !photo.base64) {
            return null;
          }

          return {
            uri: photo.uri,
            base64: photo.base64,
            mimeType: 'image/jpeg',
          };
        } catch {
          return null;
        }
      },
    }),
    [isReady],
  );

  return (
    <View className='w-full max-w-[420px] aspect-[3/4] rounded-3xl overflow-hidden bg-background-secondary'>
      <CameraView
        ref={cameraRef}
        facing={facing}
        mode='picture'
        style={StyleSheet.absoluteFill}
        onCameraReady={() => setIsReady(true)}
      />
      <IconButton
        iconName='close'
        onPress={onClose}
        className='absolute top-16 right-16 w-40 h-40 bg-background-secondary/80 rounded-full'
      />
    </View>
  );
}
