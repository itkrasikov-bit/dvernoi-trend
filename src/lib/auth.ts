const COOKIE_NAME = 'dt_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

function secret(): string {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'dvernoi-trend-dev-secret';
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/** Подпись вида "<exp>.<hmac>" — проверяется и в middleware (edge), и в node. */
export async function createSession(): Promise<{ name: string; value: string; maxAge: number }> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${exp}.${await hmac(String(exp))}`;
  return { name: COOKIE_NAME, value, maxAge: MAX_AGE };
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expRaw, sig] = token.split('.');
  if (!expRaw || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = await hmac(expRaw);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const SESSION_COOKIE = COOKIE_NAME;
