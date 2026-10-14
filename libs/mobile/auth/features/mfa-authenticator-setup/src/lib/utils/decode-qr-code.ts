export const decodeQrCode = (dataUri: string): string => globalThis.atob(dataUri.split(',')[1] ?? '');
