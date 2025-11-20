import { Image } from 'react-native-compressor';
import { CompressorOptions } from 'react-native-compressor/lib/typescript/Image';

export const compressImage = async (path: string, options?: CompressorOptions): Promise<string> => {
  return Image.compress(path, options);
};
