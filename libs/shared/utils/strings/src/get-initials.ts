export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/)?.slice(0, 2);
  const initials = parts.length < 2 ? name.slice(0, 2) : parts.map((part) => part.charAt(0).toUpperCase()).join('');

  return initials;
}
