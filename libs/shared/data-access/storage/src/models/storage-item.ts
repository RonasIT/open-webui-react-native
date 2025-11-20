import { isNil } from 'lodash';
import { MMKV } from 'react-native-mmkv';
import { StorageItemMethods } from './storage-item-methods';

export class StorageItem implements StorageItemMethods {
  constructor(
    private key: string,
    private storage: MMKV,
  ) {}

  public set(value: string | number | boolean | null): void {
    if (isNil(value)) {
      this.remove();
    } else {
      this.storage.set(this.key, value);
    }
  }

  public get(): string | undefined {
    return this.storage.getString(this.key);
  }

  public remove(): void {
    this.storage.delete(this.key);
  }
}
