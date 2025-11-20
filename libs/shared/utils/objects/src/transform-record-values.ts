import { plainToInstance } from 'class-transformer';

export function transformRecordValues<T>(value: unknown, type: new (...args: Array<any>) => T): Record<string, T> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([id, plain]) => {
      const inst = plainToInstance(type, plain as object, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });

      return [id, inst];
    }),
  );
}
