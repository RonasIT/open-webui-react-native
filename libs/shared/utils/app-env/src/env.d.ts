export class AppEnv<TEnv extends string | number> {
  private readonly env: TEnv;

  public get current(): TEnv;

  constructor(env: TEnv);

  public select<TValue>(options: Record<TEnv, TValue> | Record<'default', TValue>): TValue;
}
