import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { StorageItem } from './models';

export const storage = new MMKV({
  id: 'mobile',
  // If we need more security, we can use EAS secret variables here
  encryptionKey: Platform.OS === 'web' ? undefined : 'mobile',
});

class AppStorageService {
  public token = new StorageItem('token', storage);
  public apiUrl = new StorageItem('apiUrl', storage);
}

export const appStorageService = new AppStorageService();
