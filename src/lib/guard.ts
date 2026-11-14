import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from './auth';

export async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export function jsonError(message: string, status = 401) {
  return Response.json({ error: message }, { status });
}
