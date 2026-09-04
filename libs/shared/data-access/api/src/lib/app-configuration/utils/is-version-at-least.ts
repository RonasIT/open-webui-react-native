const VERSION_PART_COUNT = 3;

// NOTE: Open WebUI reports its version as `MAJOR.MINOR.PATCH`, optionally with a build suffix that
// `parseInt` drops. A version that cannot be read at all counts as older than the minimum: hiding a
// feature is a milder failure than calling an endpoint the backend does not serve.
export const isVersionAtLeast = (version: string | undefined, minimum: string): boolean => {
  const parse = (value: string): Array<number> => value.split('.').slice(0, VERSION_PART_COUNT).map(Number.parseInt);

  const parsedVersion = parse(version ?? '');

  if (parsedVersion.length < VERSION_PART_COUNT || parsedVersion.some(Number.isNaN)) {
    return false;
  }

  const parsedMinimum = parse(minimum);

  for (let index = 0; index < VERSION_PART_COUNT; index++) {
    if (parsedVersion[index] !== parsedMinimum[index]) {
      return parsedVersion[index] > parsedMinimum[index];
    }
  }

  return true;
};
