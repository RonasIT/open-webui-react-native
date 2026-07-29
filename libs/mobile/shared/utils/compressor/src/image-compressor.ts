import { Image as ImageCompressor } from 'react-native-compressor';

export const compressImage = async (
  path: string,
  options?: NonNullable<Parameters<typeof ImageCompressor.compress>[1]>,
): Promise<string> => {
  return ImageCompressor.compress(path, options);
};
