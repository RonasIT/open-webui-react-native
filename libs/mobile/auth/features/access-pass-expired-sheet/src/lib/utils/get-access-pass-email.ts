// NOTE: The Access pass is a JWT; its payload names the person Cloudflare Access let in. The signature is
// Cloudflare's business: the app only compares two passes it received itself.
export const getAccessPassEmail = (accessPass: string): string | undefined => {
  try {
    const payload = accessPass.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? '';
    const { email } = JSON.parse(globalThis.atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));

    return typeof email === 'string' ? email.toLowerCase() : undefined;
  } catch {
    return undefined;
  }
};
