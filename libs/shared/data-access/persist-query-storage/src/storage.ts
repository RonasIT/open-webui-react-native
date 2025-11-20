import { MMKV } from 'react-native-mmkv';
import { persistStorageConfig } from './config';

export const persistStorage = new MMKV({
  id: persistStorageConfig.mmkvStorageID,
});
