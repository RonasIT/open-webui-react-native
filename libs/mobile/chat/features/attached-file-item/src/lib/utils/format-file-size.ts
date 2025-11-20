import { clamp, round } from 'lodash-es';

export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';

  const kilo = 1024;
  const units = ['B', 'Kb', 'Mb', 'Gb', 'Tb'];
  const precision = clamp(decimals, 0, 20);

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(kilo));
  const sizeInUnit = bytes / Math.pow(kilo, unitIndex);
  const roundedSize = round(sizeInUnit, precision);

  return `${roundedSize} ${units[unitIndex]}`;
}
