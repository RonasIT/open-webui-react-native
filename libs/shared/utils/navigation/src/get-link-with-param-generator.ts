import { isNil, isNull } from 'lodash-es';

export type LinkWithOptionalParamsGenerator<TRootParams extends object = never> = keyof TRootParams extends never
  ? () => string
  : (args?: TRootParams) => string;

export const getLinkWithParamsGenerator = <TRootParams extends object = never>(
  basePath: string,
  isAppSearchParams = false,
): LinkWithOptionalParamsGenerator<TRootParams> => {
  return ((args?: TRootParams) => {
    if (!args || Object.keys(args).length === 0) {
      return basePath;
    }

    const hasSlug = 'id' in args && basePath.includes('[id]');
    const resultBasePath = hasSlug ? basePath.replace('[id]', String(args.id)) : basePath;

    const queryString = Object.entries(args)
      .map(([key, value]) => {
        if (isNil(value) || (hasSlug && key === 'id')) {
          return null;
        }

        const encodedValue = isAppSearchParams ? JSON.stringify(value) : encodeURIComponent(String(value));

        return `${key}=${encodedValue}`;
      })
      .filter((param) => !isNull(param))
      .join('&');

    return `${resultBasePath}?${queryString}`;
  }) as LinkWithOptionalParamsGenerator<TRootParams>;
};
