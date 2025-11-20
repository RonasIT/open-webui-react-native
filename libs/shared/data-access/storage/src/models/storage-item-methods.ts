export interface StorageItemMethods {
  set(value: string | number | boolean | null): void;
  get(): string | undefined;
  remove(): void;
}
