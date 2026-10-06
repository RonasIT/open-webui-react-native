export function joinString(parts: Array<string | null | undefined>, separator = ' '): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(separator);
}
